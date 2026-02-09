import { NextResponse } from "next/server";
import { db } from "@/db";
import {
    classes,
    teacherClasses,
    classSessions,
    classSchedules,
    classEnrollments,
    classAttendances,
} from "@/db/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";

import { getAuthUser } from "@/lib/auth/getAuthUser";

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

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get current week range
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // 1. Get total classes taught by this teacher
        const [totalClassesResult] = await db
            .select({ count: count() })
            .from(teacherClasses)
            .where(eq(teacherClasses.teacherId, teacherId));

        // 2. Get classes with details
        const teacherClassesList = await db
            .select({
                classId: classes.id,
                className: classes.name,
                classCode: classes.code,
            })
            .from(teacherClasses)
            .innerJoin(classes, eq(teacherClasses.classId, classes.id))
            .where(eq(teacherClasses.teacherId, teacherId));

        // 3. Get total enrolled students across all classes
        let totalStudents = 0;
        if (teacherClassesList.length > 0) {
            const classIds = teacherClassesList.map((c) => c.classId);
            const [studentsResult] = await db
                .select({ count: count() })
                .from(classEnrollments)
                .where(
                    sql`${classEnrollments.classId} IN (${sql.join(
                        classIds.map((id) => sql`${id}`),
                        sql`, `
                    )})`
                );
            totalStudents = studentsResult?.count || 0;
        }

        // 4. Get today's sessions
        const todaySessions = await db
            .select({
                sessionId: classSessions.id,
                sessionDate: classSessions.date,
                sessionStatus: classSessions.status,
                classId: classes.id,
                className: classes.name,
                classCode: classes.code,
                startTime: classSchedules.startTime,
                endTime: classSchedules.endTime,
            })
            .from(classSessions)
            .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .innerJoin(classes, eq(classSchedules.classId, classes.id))
            .innerJoin(teacherClasses, eq(classes.id, teacherClasses.classId))
            .where(
                and(
                    eq(teacherClasses.teacherId, teacherId),
                    gte(classSessions.date, today.toISOString().split("T")[0]),
                    lte(classSessions.date, tomorrow.toISOString().split("T")[0])
                )
            );

        // 5. Get this week's sessions count
        const [weekSessionsResult] = await db
            .select({ count: count() })
            .from(classSessions)
            .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .innerJoin(classes, eq(classSchedules.classId, classes.id))
            .innerJoin(teacherClasses, eq(classes.id, teacherClasses.classId))
            .where(
                and(
                    eq(teacherClasses.teacherId, teacherId),
                    gte(classSessions.date, startOfWeek.toISOString().split("T")[0]),
                    lte(classSessions.date, endOfWeek.toISOString().split("T")[0])
                )
            );

        // 6. Get attendance statistics (this week)
        const attendanceStats = await db
            .select({
                total: count(),
                present: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'present' THEN 1 END)`,
                late: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'late' THEN 1 END)`,
                absent: sql<number>`COUNT(CASE WHEN ${classAttendances.status} = 'absent' THEN 1 END)`,
            })
            .from(classAttendances)
            .innerJoin(classSessions, eq(classAttendances.sessionId, classSessions.id))
            .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .innerJoin(classes, eq(classSchedules.classId, classes.id))
            .innerJoin(teacherClasses, eq(classes.id, teacherClasses.classId))
            .where(
                and(
                    eq(teacherClasses.teacherId, teacherId),
                    gte(classSessions.date, startOfWeek.toISOString().split("T")[0]),
                    lte(classSessions.date, endOfWeek.toISOString().split("T")[0])
                )
            );

        const stats = attendanceStats[0] || { total: 0, present: 0, late: 0, absent: 0 };
        const attendanceRate =
            stats.total > 0
                ? Math.round(((Number(stats.present) + Number(stats.late)) / stats.total) * 100)
                : 0;

        // 7. Get sessions needing attendance (completed but not all marked)
        const completedSessions = await db
            .select({
                sessionId: classSessions.id,
                sessionDate: classSessions.date,
                className: classes.name,
                classCode: classes.code,
            })
            .from(classSessions)
            .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .innerJoin(classes, eq(classSchedules.classId, classes.id))
            .innerJoin(teacherClasses, eq(classes.id, teacherClasses.classId))
            .where(
                and(
                    eq(teacherClasses.teacherId, teacherId),
                    eq(classSessions.status, "completed"),
                    lte(classSessions.date, today.toISOString().split("T")[0])
                )
            )
            .limit(5);

        // Check which sessions have attendance marked
        const sessionsNeedingAttention = [];
        for (const session of completedSessions) {
            const [attendanceCount] = await db
                .select({ count: count() })
                .from(classAttendances)
                .where(eq(classAttendances.sessionId, session.sessionId));

            if (attendanceCount?.count === 0) {
                sessionsNeedingAttention.push(session);
            }
        }

        return NextResponse.json({
            overview: {
                totalClasses: totalClassesResult?.count || 0,
                totalStudents,
                todaySessionsCount: todaySessions.length,
                weekSessionsCount: weekSessionsResult?.count || 0,
            },
            todaySessions: todaySessions.map((s) => ({
                id: s.sessionId,
                className: s.className,
                classCode: s.classCode,
                date: s.sessionDate,
                startTime: s.startTime,
                endTime: s.endTime,
                status: s.sessionStatus,
            })),
            attendanceStats: {
                total: stats.total,
                present: Number(stats.present),
                late: Number(stats.late),
                absent: Number(stats.absent),
                attendanceRate,
            },
            recentClasses: teacherClassesList.slice(0, 4).map((c) => ({
                id: c.classId,
                name: c.className,
                code: c.classCode,
            })),
            sessionsNeedingAttention: sessionsNeedingAttention.slice(0, 3),
        });
    } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
