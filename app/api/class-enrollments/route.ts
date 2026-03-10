import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { classEnrollments, users, classes, students } from "@/db/schema";

export const maxDuration = 60;

type CreateEnrollmentPayload = {
  studentId?: string;
  classId?: string;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const query = searchParams.get("q") || searchParams.get("query");
    const limit = Math.max(1, Number(searchParams.get("limit") || 10));
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const fields = searchParams.get("fields");

    const offset = limit && page ? (Number(page) - 1) * Number(limit) : 0;

    const filters = [];
    if (classId) {
      filters.push(eq(classEnrollments.classId, classId));
    }
    if (studentId) {
      filters.push(eq(classEnrollments.studentId, studentId));
    }

    if (query) {
      const tokens = query.split(/\s+/).filter(t => t.length > 0);

      tokens.forEach(token => {
        const dbQuery = `%${token}%`;
        const fullNameSql = sql`concat_ws(' ', ${students.firstName}, ${students.middleName}, ${students.lastName})`;

        filters.push(
          or(
            ilike(students.firstName, dbQuery),
            ilike(students.middleName, dbQuery),
            ilike(students.lastName, dbQuery),
            ilike(fullNameSql, dbQuery),
            ilike(students.email, dbQuery),
            ilike(classes.name, dbQuery),
            ilike(classes.code, dbQuery)
          )
        );
      });
    }

    const where = filters.length ? and(...filters) : undefined;

    // Helper to filter object fields
    const filterFields = (obj: Record<string, unknown>, fields: string[] | null) => {
      if (!fields) return obj;
      const filtered: Record<string, unknown> = {};
      fields.forEach((f: string) => {
        if (f in obj) filtered[f] = obj[f];
      });
      return filtered;
    };

    const fieldList = fields ? fields.split(",").map((f: string) => f.trim()) : null;

    // Optimized query with proper joins and parallel execution
    const [dbData, countResult] = await Promise.all([
      db
        .select({
          id: classEnrollments.id,
          studentId: classEnrollments.studentId,
          studentName: sql<string>`concat_ws(' ', ${students.firstName}, ${students.middleName}, ${students.lastName})`,
          studentEmail: students.email,
          classId: classEnrollments.classId,
          className: sql<string>`concat(${classes.name}, ' (', ${classes.code}, ')')`,
          enrolledAt: classEnrollments.enrolledAt,
          enrolledBy: classEnrollments.enrolledBy,
          enrolledByName: users.name, // Direct join to get admin name
        })
        .from(classEnrollments)
        .leftJoin(students, eq(classEnrollments.studentId, students.id))
        .leftJoin(classes, eq(classEnrollments.classId, classes.id))
        .leftJoin(users, eq(classEnrollments.enrolledBy, users.id))
        .where(where)
        .orderBy(desc(classEnrollments.enrolledAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)` })
        .from(classEnrollments)
        .leftJoin(students, eq(classEnrollments.studentId, students.id))
        .leftJoin(classes, eq(classEnrollments.classId, classes.id))
        .where(where)
    ]);

    const totalCount = Number(countResult[0]?.total || 0);
    const data = dbData.map(item => filterFields(item, fieldList));

    return NextResponse.json({
      success: true,
      data,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
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

    // Check if already enrolled in ANY active class
    const [existing] = await db
      .select({
        id: classEnrollments.id,
        className: classes.name,
        classCode: classes.code
      })
      .from(classEnrollments)
      .leftJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(
        and(
          eq(classEnrollments.studentId, studentId),
          eq(classEnrollments.status, 'active')
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Student is already enrolled in an active class: ${existing.className} (${existing.classCode})`
        },
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
