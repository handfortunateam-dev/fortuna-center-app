import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teacherClasses, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// Extract UUID from formatted string like "Name - email (uuid)" or just a raw UUID
function extractUUID(value: string): string | null {
  if (!value) return null;
  const uuidMatch = value.match(
    /\(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/i,
  );
  if (uuidMatch) return uuidMatch[1];
  // Check if value itself is a UUID
  const directMatch = value.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
  if (directMatch) return directMatch[0];
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 },
      );
    }

    const assignedBy = dbUser[0].id;

    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 },
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      failedRows: [] as Record<string, unknown>[],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const currentFailedRow = { ...row } as Record<string, unknown>;
      try {
        // Extract teacherId and classId from formatted dropdown values or raw IDs
        const teacherRaw =
          row.teacherId || row.Teacher || row.teacher || row["Teacher ID"] || "";
        const classRaw =
          row.classId || row.Class || row.class || row["Class ID"] || "";

        const teacherId = extractUUID(String(teacherRaw));
        const classId = extractUUID(String(classRaw));

        if (!teacherId || !classId) {
          const msg = `Row ${i + 1}: Missing Teacher ID or Class ID`;
          results.errors.push(msg);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        // Check for duplicate assignment
        const existing = await db
          .select()
          .from(teacherClasses)
          .where(
            and(
              eq(teacherClasses.teacherId, teacherId),
              eq(teacherClasses.classId, classId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          const msg = `Row ${i + 1}: Teacher already assigned to this class`;
          results.errors.push(msg);
          currentFailedRow.Error = msg;
          results.failedRows.push(currentFailedRow);
          results.failed++;
          continue;
        }

        await db.insert(teacherClasses).values({
          teacherId,
          classId,
          assignedBy,
        });

        results.success++;
      } catch (rowError) {
        console.error("Error processing row:", rowError);
        const errorMsg =
          rowError instanceof Error ? rowError.message : "Unknown error";
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${errorMsg}`);
        currentFailedRow.Error = errorMsg;
        results.failedRows.push(currentFailedRow);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success} assignments added, ${results.failed} failed`,
      details: results,
    });
  } catch (error) {
    console.error("Error importing teacher-classes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import teacher-class assignments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
