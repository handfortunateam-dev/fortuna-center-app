import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments, users, classes } from "@/db/schema";

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

    // Join with users (student) and classes to get names
    const data = await db
      .select({
        id: classEnrollments.id,
        studentId: classEnrollments.studentId,
        studentName: users.name,
        classId: classEnrollments.classId,
        className: classes.name,
        enrolledAt: classEnrollments.enrolledAt,
        enrolledBy: classEnrollments.enrolledBy,
      })
      .from(classEnrollments)
      .leftJoin(users, eq(classEnrollments.studentId, users.id))
      .leftJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(where)
      .orderBy(desc(classEnrollments.enrolledAt));

    // Fetch enrolledBy names separately
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
        return {
          ...item,
          enrolledByName,
        };
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

    // Verify student exists
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.id, studentId))
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

    // Try to get session user for enrolledBy (optional)
    let enrolledById: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        const [currentUser] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        if (currentUser) {
          enrolledById = currentUser.id;
        }
      }
    } catch (error) {
      // Session not available (e.g., onboarding flow), continue with null enrolledBy
      console.log("No session available for enrolledBy, setting to null");
    }

    const [created] = await db
      .insert(classEnrollments)
      .values({
        studentId,
        classId,
        enrolledBy: enrolledById, // Can be null for onboarding flow
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
