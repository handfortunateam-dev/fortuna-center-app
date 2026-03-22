import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { teacherClasses, classes } from "@/db/schema";
import { users } from "@/db/schema/users.schema";

type CreateTeacherClassPayload = {
  teacherId?: string;
  classId?: string;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const fields = searchParams.get("fields");

    const offset = limit && page ? (Number(page) - 1) * Number(limit) : 0;

    const filters = [];
    if (classId) {
      filters.push(eq(teacherClasses.classId, classId));
    }
    if (teacherId) {
      filters.push(eq(teacherClasses.teacherId, teacherId));
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

    // Join with users (teacher) and classes to get names
    const dbData = await db
      .select({
        id: teacherClasses.id,
        teacherId: teacherClasses.teacherId,
        teacherName: users.name,
        classId: teacherClasses.classId,
        className: classes.name,
        classLevel: classes.level,
        assignedAt: teacherClasses.assignedAt,
        assignedBy: teacherClasses.assignedBy,
        assignedByName: sql<string>`(SELECT name FROM users WHERE id = ${teacherClasses.assignedBy} LIMIT 1)`,
      })
      .from(teacherClasses)
      .leftJoin(users, eq(teacherClasses.teacherId, users.id))
      .leftJoin(classes, eq(teacherClasses.classId, classes.id))
      .where(where)
      .orderBy(desc(teacherClasses.assignedAt))
      .limit(limit ? Number(limit) : 1000)
      .offset(offset);

    // Get total count for pagination
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(teacherClasses)
      .where(where);

    const data = dbData.map((item) => filterFields(item, fieldList));

    return NextResponse.json({
      success: true,
      data,
      totalCount: Number(total)
    });
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
    // Get session user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateTeacherClassPayload;
    const { teacherId, classId } = body;

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
        assignedBy: user.id,
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
