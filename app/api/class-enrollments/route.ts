import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments } from "@/db/schema";

type CreateEnrollmentPayload = {
  studentId?: string;
  classId?: string;
  enrolledBy?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const filters = [];
    if (classId) {
      filters.push(eq(classEnrollments.classId, classId));
    }
    if (studentId) {
      filters.push(eq(classEnrollments.studentId, studentId));
    }

    const where = filters.length ? and(...filters) : undefined;
    const data = await db
      .select()
      .from(classEnrollments)
      .where(where)
      .orderBy(desc(classEnrollments.enrolledAt));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrollments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEnrollmentPayload;
    const { studentId, classId, enrolledBy = null } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: studentId, classId" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: classEnrollments.id })
      .from(classEnrollments)
      .where(and(eq(classEnrollments.studentId, studentId), eq(classEnrollments.classId, classId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Student is already enrolled in this class" },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(classEnrollments)
      .values({
        studentId,
        classId,
        enrolledBy,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Enrollment created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create enrollment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
