import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { teacherClasses, users, classes } from "@/db/schema";

type CreateTeacherClassPayload = {
  teacherId?: string;
  classId?: string;
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

    // Join with users (teacher) and classes to get names
    const data = await db
      .select({
        id: teacherClasses.id,
        teacherId: teacherClasses.teacherId,
        teacherName: users.name,
        classId: teacherClasses.classId,
        className: classes.name,
        assignedAt: teacherClasses.assignedAt,
        assignedBy: teacherClasses.assignedBy,
      })
      .from(teacherClasses)
      .leftJoin(users, eq(teacherClasses.teacherId, users.id))
      .leftJoin(classes, eq(teacherClasses.classId, classes.id))
      .where(where)
      .orderBy(desc(teacherClasses.assignedAt));

    // Fetch assignedBy names separately
    const dataWithAssignedBy = await Promise.all(
      data.map(async (item) => {
        let assignedByName = null;
        if (item.assignedBy) {
          const [assignedUser] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, item.assignedBy))
            .limit(1);
          assignedByName = assignedUser?.name || null;
        }
        return {
          ...item,
          assignedByName,
        };
      })
    );

    return NextResponse.json({ success: true, data: dataWithAssignedBy });
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lookup database user ID from Clerk ID
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
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
        assignedBy: currentUser.id, // Auto-assign from session
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
