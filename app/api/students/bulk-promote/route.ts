import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { students, classEnrollments, classes } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthUser();
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sourceClassId, targetClassId } = body;

    if (!sourceClassId || !targetClassId) {
      return NextResponse.json(
        { success: false, message: "Source and Target Class IDs are required" },
        { status: 400 }
      );
    }

    if (sourceClassId === targetClassId) {
      return NextResponse.json(
        { success: false, message: "Source and Target class cannot be the same" },
        { status: 400 }
      );
    }

    // Perform bulk promotion in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Verify target class and get its level
      const [targetClass] = await tx
        .select()
        .from(classes)
        .where(eq(classes.id, targetClassId))
        .limit(1);

      if (!targetClass) {
        throw new Error("Target class not found");
      }

      // 2. Find all active students in the source class
      const activeEnrollments = await tx
        .select()
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.classId, sourceClassId),
            eq(classEnrollments.status, "active")
          )
        );

      if (activeEnrollments.length === 0) {
        throw new Error("No active students found in the source class");
      }

      const studentIds = activeEnrollments.map((e) => e.studentId);

      // 3. Mark source active enrollments as completed
      await tx
        .update(classEnrollments)
        .set({ status: "completed" })
        .where(
          and(
            eq(classEnrollments.classId, sourceClassId),
            inArray(classEnrollments.studentId, studentIds),
            eq(classEnrollments.status, "active")
          )
        );

      // 4. Create new active enrollments in the target class
      const newEnrollments = await tx
        .insert(classEnrollments)
        .values(
          studentIds.map((studentId) => ({
            studentId,
            classId: targetClassId,
            status: "active",
            enrolledBy: authenticatedUser.id,
          }))
        )
        .returning();

      // 5. Update students' current level to the target class level
      await tx
        .update(students)
        .set({
          currentLevel: targetClass.level,
          updatedAt: new Date(),
        })
        .where(inArray(students.id, studentIds));

      return {
        promotedCount: studentIds.length,
        newEnrollments,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully promoted ${result.promotedCount} students`,
      data: result,
    });
  } catch (error) {
    console.error("Error in bulk promotion:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process bulk promotion",
      },
      { status: 500 }
    );
  }
}
