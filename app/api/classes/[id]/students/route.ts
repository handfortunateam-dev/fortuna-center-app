import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments, students, classes } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Verify class exists
    const [classInfo] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classInfo) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      );
    }

    // 2. Fetch enrolled students
    // We join class enrollments with students to get their details
    const enrolledStudents = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        studentId: students.studentId,
        email: students.email,
        phone: students.phone,
        status: classEnrollments.status,
        enrolledAt: classEnrollments.enrolledAt,
        currentLevel: students.currentLevel,
      })
      .from(classEnrollments)
      .innerJoin(students, eq(classEnrollments.studentId, students.id))
      .where(
        and(
          eq(classEnrollments.classId, id),
          eq(classEnrollments.status, 'active') // Only show active enrollments by default
        )
      );

    return NextResponse.json({
      success: true,
      data: enrolledStudents,
      classInfo: {
        id: classInfo.id,
        name: classInfo.name,
        code: classInfo.code,
      }
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrolled students",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
