import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classSessions, classSchedules, classes, users } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// GET - List sessions by date range
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filters = [];
    if (startDate) filters.push(gte(classSessions.date, startDate));
    if (endDate) filters.push(lte(classSessions.date, endDate));

    const data = await db
        .select({
            id: classSessions.id,
            scheduleId: classSessions.scheduleId,
            date: classSessions.date,
            status: classSessions.status,
            // Include schedule details
            dayOfWeek: classSchedules.dayOfWeek,
            startTime: classSchedules.startTime,
            endTime: classSchedules.endTime,
            className: classes.name,
            teacherName: users.name,
        })
        .from(classSessions)
        .leftJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
        .leftJoin(classes, eq(classSchedules.classId, classes.id))
        .leftJoin(users, eq(classSessions.teacherId, users.id))
        .where(filters.length ? and(...filters) : undefined);

    return NextResponse.json({ success: true, data });
}
