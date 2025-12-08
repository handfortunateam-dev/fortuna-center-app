import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherClasses } from "@/db/schema";

type CreateTeacherClassPayload = {
  teacherId?: string;
  classId?: string;
  assignedBy?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");

    const filters = [];
    if (classId) {
      filters.push(eq(teacherClasses.classId, classId));
    }
    if (teacherId) {
      filters.push(eq(teacherClasses.teacherId, teacherId));
    }

    const where = filters.length ? and(...filters) : undefined;
    const data = await db
      .select()
      .from(teacherClasses)
      .where(where)
      .orderBy(desc(teacherClasses.assignedAt));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teacher assignments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTeacherClassPayload;
    const { teacherId, classId, assignedBy = null } = body;

    if (!teacherId || !classId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: teacherId, classId" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: teacherClasses.id })
      .from(teacherClasses)
      .where(and(eq(teacherClasses.teacherId, teacherId), eq(teacherClasses.classId, classId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Teacher already assigned to this class" },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(teacherClasses)
      .values({
        teacherId,
        classId,
        assignedBy,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Teacher assigned successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning teacher:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign teacher",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
