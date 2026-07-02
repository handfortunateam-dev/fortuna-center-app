import { NextResponse } from "next/server";
import { db } from "@/db";
import {
    classSessions,
    classSchedules,
    classes,
    classEnrollments,
    classAttendances,
} from "@/db/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";

import { getAuthUser } from "@/lib/auth/getAuthUser";
import { teacherClasses as teacherClassesTable } from "@/db/schema";

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const teacherId = user.id;

        // Get current date range (today and upcoming 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Get all sessions for this teacher's classes
        const sessions = await db
            .select({
                sessionId: classSessions.id,
                sessionDate: classSessions.date,
                sessionStatus: classSessions.status,
                actualStartTime: classSessions.actualStartTime,
                actualEndTime: classSessions.actualEndTime,
                scheduleId: classSchedules.id,
                classId: classes.id,
                className: classes.name,
                classCode: classes.code,
                startTime: classSchedules.startTime,
                endTime: classSchedules.endTime,
                dayOfWeek: classSchedules.dayOfWeek,
            })
            .from(classSessions)
            .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .innerJoin(classes, eq(classSchedules.classId, classes.id))
            .innerJoin(teacherClassesTable, eq(classes.id, teacherClassesTable.classId))
            .where(
                and(
                    eq(teacherClassesTable.teacherId, teacherId),
                    gte(classSessions.date, today.toISOString().split("T")[0]),
                    lte(classSessions.date, nextWeek.toISOString().split("T")[0])
                )
            )
            .orderBy(classSessions.date, classSchedules.startTime);

        // For each session, get student count and attendance count
        const sessionsWithStats = await Promise.all(
            sessions.map(async (session) => {
                // Count enrolled students
                const [enrollmentCount] = await db
                    .select({ count: count() })
                    .from(classEnrollments)
                    .where(eq(classEnrollments.classId, session.classId));

                // Count attendance records for this session
                const attendanceStats = await db
                    .select({
                        total: count(),
                        present: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'present' THEN 1 END)`,
                        late: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'late' THEN 1 END)`,
                        absent: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'absent' THEN 1 END)`,
                    })
                    .from(classAttendances)
                    .where(eq(classAttendances.sessionId, session.sessionId));

                const stats = attendanceStats[0] || { total: 0, present: 0, late: 0, absent: 0 };

                return {
                    id: session.sessionId,
                    className: session.className,
                    classCode: session.classCode,
                    date: session.sessionDate,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    dayOfWeek: session.dayOfWeek,
                    status: session.sessionStatus,
                    studentCount: enrollmentCount?.count || 0,
                    attendanceRecorded: stats.total > 0,
                    attendedCount: Number(stats.present) + Number(stats.late),
                    presentCount: Number(stats.present),
                    lateCount: Number(stats.late),
                    absentCount: Number(stats.absent),
                };
            })
        );

        return NextResponse.json(sessionsWithStats);
    } catch (error) {
        console.error("Error fetching teacher sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}
