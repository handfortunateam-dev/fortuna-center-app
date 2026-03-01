import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments, users, classes, students } from "@/db/schema";

type CreateEnrollmentPayload = {
  studentId?: string;
  classId?: string;
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

    // Join with students table (not users) to get student name
    const data = await db
      .select({
        id: classEnrollments.id,
        studentId: classEnrollments.studentId,
        studentName: sql<string>`concat_ws(' ', ${students.firstName}, ${students.middleName}, ${students.lastName})`,
        studentEmail: students.email,
        classId: classEnrollments.classId,
        className: classes.name,
        enrolledAt: classEnrollments.enrolledAt,
        enrolledBy: classEnrollments.enrolledBy,
      })
      .from(classEnrollments)
      .leftJoin(students, eq(classEnrollments.studentId, students.id))
      .leftJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(where)
      .orderBy(desc(classEnrollments.enrolledAt));

    // Fetch enrolledBy names (admin) from users table
    const dataWithEnrolledBy = await Promise.all(
      data.map(async (item) => {
        let enrolledByName = null;
        if (item.enrolledBy) {
          const [enrolledUser] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, item.enrolledBy))
            .limit(1);
          enrolledByName = enrolledUser?.name || null;
        }
        return { ...item, enrolledByName };
      })
    );

    return NextResponse.json({ success: true, data: dataWithEnrolledBy });
  } catch (error) {
    console.error("Error fetching class enrollments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch class enrollments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEnrollmentPayload;
    const { studentId, classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: studentId, classId" },
        { status: 400 }
      );
    }

    // Verify student exists in students table
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Verify class exists
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classRecord) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const [existing] = await db
      .select({ id: classEnrollments.id })
      .from(classEnrollments)
      .where(and(eq(classEnrollments.studentId, studentId), eq(classEnrollments.classId, classId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Student already enrolled in this class" },
        { status: 409 }
      );
    }

    // Get enrolledBy from current admin session (optional)
    let enrolledById: string | null = null;
    const authUser = await getAuthUser();
    if (authUser) {
      enrolledById = authUser.id;
    }

    const [created] = await db
      .insert(classEnrollments)
      .values({
        studentId,
        classId,
        enrolledBy: enrolledById,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Student enrolled successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error enrolling student:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enroll student",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
