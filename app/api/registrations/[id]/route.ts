import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [reg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!reg) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: reg });
  } catch (error: unknown) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER" && user.role !== "ADMINISTRATIVE_EMPLOYEE")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { status, adminNotes } = body;

    // Fetch the current registration first
    const [currentReg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!currentReg) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 },
      );
    }

    // Build update payload
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const [updated] = await db
      .update(registrations)
      .set(updates)
      .where(eq(registrations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    // ─── Auto-create Student when accepted ───────────────────────────────────
    let createdStudent = null;

    if (status === "accepted" && currentReg.status !== "accepted") {
      // Dynamically import students schema to avoid circular imports
      const { students } = await import("@/db/schema");

      // Guard: check if a student with the same phone already exists
      // (prevents duplicate if registration was accepted before and then re-accepted)
      const [existingByPhone] = await db
        .select({ id: students.id, studentId: students.studentId })
        .from(students)
        .where(eq(students.phone, currentReg.phone))
        .limit(1);

      if (existingByPhone) {
        // Student already exists — skip creation but return the info
        return NextResponse.json({
          success: true,
          data: updated,
          studentCreated: false,
          message: "Registration accepted. A student with this phone number already exists.",
          existingStudentId: existingByPhone.studentId,
        });
      }

      // Step 1: Insert with temporary Student ID
      const tempId = `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const [inserted] = await db
        .insert(students)
        .values({
          studentId: tempId,
          registrationDate: new Date().toISOString().split("T")[0],
          firstName: currentReg.firstName,
          middleName: null,
          lastName: currentReg.lastName ?? "",
          nickname: currentReg.nickname ?? currentReg.firstName,
          gender: currentReg.gender,
          placeOfBirth: currentReg.placeOfBirth ?? null,
          dateOfBirth: currentReg.dateOfBirth ?? null,
          email: currentReg.email ?? null,
          phone: currentReg.phone,
          address: currentReg.address ?? null,
          education: currentReg.education ?? null,
          occupation: currentReg.occupation ?? null,
          userId: null,
          status: "active",
        })
        .returning();

      // Step 2: Generate proper Student ID: ${year}${studentNumber padded to 4}
      const year = new Date().getFullYear();
      const sequence = String(inserted.studentNumber).padStart(4, "0");
      const generatedStudentId = `${year}${sequence}`;

      const [finalStudent] = await db
        .update(students)
        .set({ studentId: generatedStudentId })
        .where(eq(students.id, inserted.id))
        .returning();

      createdStudent = finalStudent;
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      data: updated,
      studentCreated: createdStudent !== null,
      ...(createdStudent && {
        student: createdStudent,
        message: `Registration accepted. Student created with ID: ${createdStudent.studentId}`,
      }),
    });
  } catch (error: unknown) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const [deleted] = await db
      .delete(registrations)
      .where(eq(registrations.id, id))
      .returning({ id: registrations.id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Registration deleted",
    });
  } catch (error: unknown) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete",
      },
      { status: 500 },
    );
  }
}
