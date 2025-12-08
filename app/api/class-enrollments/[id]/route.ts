import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments } from "@/db/schema";

const notFoundResponse = () =>
  NextResponse.json({ success: false, message: "Enrollment not found" }, { status: 404 });

type UpdateEnrollmentPayload = {
  studentId?: string;
  classId?: string;
  enrolledBy?: string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [record] = await db
      .select()
      .from(classEnrollments)
      .where(eq(classEnrollments.id, id))
      .limit(1);

    if (!record) {
      return notFoundResponse();
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrollment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [deleted] = await db
      .delete(classEnrollments)
      .where(eq(classEnrollments.id, id))
      .returning({ id: classEnrollments.id });

    if (!deleted) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete enrollment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = (await request.json()) as UpdateEnrollmentPayload;
    const { studentId, classId, enrolledBy } = body;

    if (
      studentId === undefined &&
      classId === undefined &&
      enrolledBy === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "No updates supplied" },
        { status: 400 }
      );
    }

    if (studentId && classId) {
      const [conflict] = await db
        .select({ id: classEnrollments.id })
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.studentId, studentId),
            eq(classEnrollments.classId, classId)
          )
        )
        .limit(1);
      if (conflict && conflict.id !== id) {
        return NextResponse.json(
          {
            success: false,
            message: "Student already enrolled in this class",
          },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (studentId !== undefined) updates.studentId = studentId;
    if (classId !== undefined) updates.classId = classId;
    if (enrolledBy !== undefined) updates.enrolledBy = enrolledBy;

    const [updated] = await db
      .update(classEnrollments)
      .set(updates)
      .where(eq(classEnrollments.id, id))
      .returning();

    if (!updated) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Enrollment updated successfully",
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update enrollment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
