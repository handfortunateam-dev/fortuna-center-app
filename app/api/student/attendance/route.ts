
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { classAttendances } from "@/db/schema/class-attendance.schema";
import { eq, desc } from "drizzle-orm";
import { StudentAttendanceSummary } from "@/features/attendance/types";

export async function GET() {
    try {
        // 1. Get the current student (Simulated: fetch first student found)
        const studentUser = await db.query.users.findFirst({
            where: eq(users.role, 'STUDENT')
        });

        if (!studentUser) {
            return NextResponse.json({ error: "No student user found in database." }, { status: 404 });
        }

        const studentId = studentUser.id;

        // 2. Fetch all attendance records for this student
        const attendanceRecords = await db.query.classAttendances.findMany({
            where: eq(classAttendances.studentId, studentId),
            with: {
                session: {
                    with: {
                        schedule: {
                            with: {
                                class: true,
                            },
                        },
                    },
                },
            },
            orderBy: [desc(classAttendances.recordedAt)],
        });

        // 3. Group by Class
        const classMap = new Map<string, StudentAttendanceSummary>();

        for (const record of attendanceRecords) {
            if (!record.session || !record.session.schedule || !record.session.schedule.class) continue;

            const classId = record.session.schedule.classId;
            const className = record.session.schedule.class.name;

            if (!classMap.has(classId)) {
                classMap.set(classId, {
                    classId,
                    className,
                    totalSessions: 0, // We will count attended sessions. To get TRUE total sessions, we'd need to query all sessions for the class.
                    // For now, let's assume total sessions = sessions where attendance was taken.
                    studentStats: {
                        present: 0,
                        absent: 0,
                        late: 0,
                        excused: 0,
                        sick: 0,
                    },
                    history: [],
                });
            }

            const summary = classMap.get(classId)!;
            summary.totalSessions++;

            // Update stats
            const status = record.status as keyof typeof summary.studentStats;
            if (summary.studentStats[status] !== undefined) {
                summary.studentStats[status]++;
            }

            // Add history
            summary.history.push({
                ...record,
                session: {
                    ...record.session,
                    date: record.session.date, // Pass string directly
                }
            });
        }

        const result = Array.from(classMap.values());

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return NextResponse.json(
            { error: "Failed to fetch attendance records" },
            { status: 500 }
        );
    }
}
