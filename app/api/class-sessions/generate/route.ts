import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classSessions, classSchedules, scheduleTeachers, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// POST - Generate sessions for a date range
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);

        const body = await request.json();
        const { scheduleIds, startDate, endDate } = body;

        // Get schedules
        const schedules = await db
            .select()
            .from(classSchedules)
            .where(inArray(classSchedules.id, scheduleIds));

        // Get first teacher for each schedule (default teacher for generated sessions)
        const teacherMap = new Map<string, string>();
        for (const schedule of schedules) {
            const [firstTeacher] = await db
                .select({ teacherId: scheduleTeachers.teacherId })
                .from(scheduleTeachers)
                .where(eq(scheduleTeachers.scheduleId, schedule.id))
                .limit(1);
            if (firstTeacher) {
                teacherMap.set(schedule.id, firstTeacher.teacherId);
            }
        }

        // Generate sessions for each day in range
        const sessionsToCreate = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();

            for (const schedule of schedules) {
                if (schedule.dayOfWeek === dayOfWeek) {
                    sessionsToCreate.push({
                        scheduleId: schedule.id,
                        teacherId: teacherMap.get(schedule.id) || null,
                        date: d.toISOString().split('T')[0],
                        status: 'scheduled' as const,
                        generatedBy: user.id,
                    });
                }
            }
        }

        if (sessionsToCreate.length > 0) {
            await db.insert(classSessions).values(sessionsToCreate);
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${sessionsToCreate.length} sessions`
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to generate sessions" }, { status: 500 });
    }
}
