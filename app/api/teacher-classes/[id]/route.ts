import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherClasses } from "@/db/schema";

const notFoundResponse = () =>
  NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });

type UpdateTeacherClassPayload = {
  teacherId?: string;
  classId?: string;
  assignedBy?: string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [record] = await db
      .select()
      .from(teacherClasses)
      .where(eq(teacherClasses.id, id))
      .limit(1);

    if (!record) {
      return notFoundResponse();
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error fetching teacher assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teacher assignment",
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
      .delete(teacherClasses)
      .where(eq(teacherClasses.id, id))
      .returning({ id: teacherClasses.id });

    if (!deleted) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Teacher assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete teacher assignment",
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
    const body = (await request.json()) as UpdateTeacherClassPayload;
    const { teacherId, classId, assignedBy } = body;

    if (
      teacherId === undefined &&
      classId === undefined &&
      assignedBy === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "No updates supplied" },
        { status: 400 }
      );
    }

    const targetTeacher = teacherId;
    const targetClass = classId;
    if (targetTeacher && targetClass) {
      const [conflict] = await db
        .select({ id: teacherClasses.id })
        .from(teacherClasses)
        .where(
          and(
            eq(teacherClasses.teacherId, targetTeacher),
            eq(teacherClasses.classId, targetClass)
          )
        )
        .limit(1);
      if (conflict && conflict.id !== id) {
        return NextResponse.json(
          {
            success: false,
            message: "Teacher already assigned to this class",
          },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (teacherId !== undefined) updates.teacherId = teacherId;
    if (classId !== undefined) updates.classId = classId;
    if (assignedBy !== undefined) updates.assignedBy = assignedBy;

    const [updated] = await db
      .update(teacherClasses)
      .set(updates)
      .where(eq(teacherClasses.id, id))
      .returning();

    if (!updated) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Teacher assignment updated successfully",
    });
  } catch (error) {
    console.error("Error updating teacher assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update teacher assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
