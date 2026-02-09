import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classSchedules, scheduleTeachers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Get all schedules for a class (no duplicates - each schedule is unique)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: classId } = await params;

        const schedules = await db
            .select({
                id: classSchedules.id,
                dayOfWeek: classSchedules.dayOfWeek,
                startTime: classSchedules.startTime,
                endTime: classSchedules.endTime,
                room: classSchedules.location,
            })
            .from(classSchedules)
            .where(eq(classSchedules.classId, classId));

        // Fetch teachers for each schedule
        const data = await Promise.all(
            schedules.map(async (schedule) => {
                const teachers = await db
                    .select({
                        id: users.id,
                        name: users.name,
                    })
                    .from(scheduleTeachers)
                    .leftJoin(users, eq(scheduleTeachers.teacherId, users.id))
                    .where(eq(scheduleTeachers.scheduleId, schedule.id));

                return { ...schedule, teachers };
            })
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching class schedules:", error);
        return NextResponse.json(
            { error: "Failed to fetch schedules" },
            { status: 500 }
        );
    }
}
