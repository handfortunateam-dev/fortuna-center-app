import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classSchedules, scheduleTeachers, users, classes } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// GET - List all schedules with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const teacherId = searchParams.get("teacherId");
        const classId = searchParams.get("classId");
        const dayOfWeek = searchParams.get("dayOfWeek");
        const isActive = searchParams.get("isActive");

        const filters = [];

        // If teacherId is provided, find schedules where this teacher is assigned
        if (teacherId) {
            const teacherScheduleIds = await db
                .select({ scheduleId: scheduleTeachers.scheduleId })
                .from(scheduleTeachers)
                .where(eq(scheduleTeachers.teacherId, teacherId));

            const ids = teacherScheduleIds.map(r => r.scheduleId);
            if (ids.length === 0) {
                return NextResponse.json({ success: true, data: [] });
            }
            filters.push(inArray(classSchedules.id, ids));
        }

        if (classId) filters.push(eq(classSchedules.classId, classId));
        if (dayOfWeek) filters.push(eq(classSchedules.dayOfWeek, parseInt(dayOfWeek)));
        if (isActive !== null) filters.push(eq(classSchedules.isActive, isActive === "true"));

        const rawSchedules = await db
            .select({
                id: classSchedules.id,
                classId: classSchedules.classId,
                className: classes.name,
                dayOfWeek: classSchedules.dayOfWeek,
                startTime: classSchedules.startTime,
                endTime: classSchedules.endTime,
                location: classSchedules.location,
                isActive: classSchedules.isActive,
                notes: classSchedules.notes,
            })
            .from(classSchedules)
            .leftJoin(classes, eq(classSchedules.classId, classes.id))
            .where(filters.length ? and(...filters) : undefined);

        // For each schedule, fetch its teachers
        const data = await Promise.all(
            rawSchedules.map(async (schedule) => {
                const teachers = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        image: users.image,
                    })
                    .from(scheduleTeachers)
                    .leftJoin(users, eq(scheduleTeachers.teacherId, users.id))
                    .where(eq(scheduleTeachers.scheduleId, schedule.id));

                return { ...schedule, teachers };
            })
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Fetch schedules error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch schedules" }, { status: 500 });
    }
}

// POST - Create new schedule
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { classId, teacherIds, dayOfWeek, startTime, endTime, location, notes } = body;

        const result = await db.transaction(async (tx) => {
            // Create the schedule
            const [created] = await tx
                .insert(classSchedules)
                .values({
                    classId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    location,
                    notes,
                    createdBy: user.id,
                })
                .returning();

            // Insert schedule_teachers
            if (teacherIds && teacherIds.length > 0) {
                await tx.insert(scheduleTeachers).values(
                    teacherIds.map((tid: string) => ({
                        scheduleId: created.id,
                        teacherId: tid,
                        assignedBy: user.id,
                    }))
                );
            }

            return created;
        });

        return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch {
        return NextResponse.json({ success: false, message: "Failed to create schedule" }, { status: 500 });
    }
}
