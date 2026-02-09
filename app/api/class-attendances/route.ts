import { NextRequest, NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { classAttendances, classSessions, classSchedules, users, classes } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionId = searchParams.get("sessionId");
        const studentId = searchParams.get("studentId");
        const classId = searchParams.get("classId");

        // Build filters for attendance table
        const attendanceFilters = [];
        if (sessionId) {
            attendanceFilters.push(eq(classAttendances.sessionId, sessionId));
        }
        if (studentId) {
            attendanceFilters.push(eq(classAttendances.studentId, studentId));
        }

        // Build filters for schedule table (classId)
        const scheduleFilters = [];
        if (classId) {
            scheduleFilters.push(eq(classSchedules.classId, classId));
        }

        // Combine all filters
        const allFilters = [...attendanceFilters, ...scheduleFilters];
        const whereClause = allFilters.length > 0 ? and(...allFilters) : undefined;

        // Join with sessions, schedules, users (student), classes to get complete info
        const query = db
            .select({
                // Attendance fields
                id: classAttendances.id,
                sessionId: classAttendances.sessionId,
                studentId: classAttendances.studentId,
                status: classAttendances.status,
                notes: classAttendances.notes,
                checkedInAt: classAttendances.checkedInAt,
                recordedBy: classAttendances.recordedBy,
                recordedAt: classAttendances.recordedAt,
                updatedAt: classAttendances.updatedAt,

                // Session info
                sessionDate: classSessions.date,
                sessionStatus: classSessions.status,
                sessionNotes: classSessions.notes,

                // Schedule info (has the actual times and class/teacher references)
                scheduleId: classSchedules.id,
                scheduleStartTime: classSchedules.startTime,
                scheduleEndTime: classSchedules.endTime,
                scheduleLocation: classSchedules.location,
                scheduleClassId: classSchedules.classId,
                sessionTeacherId: classSessions.teacherId,

                // Student info
                studentName: users.name,
                studentEmail: users.email,

                // Class info
                className: classes.name,
            })
            .from(classAttendances)
            .leftJoin(classSessions, eq(classAttendances.sessionId, classSessions.id))
            .leftJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
            .leftJoin(users, eq(classAttendances.studentId, users.id))
            .leftJoin(classes, eq(classSchedules.classId, classes.id));

        // Apply where clause if filters exist
        const finalQuery = whereClause ? query.where(whereClause) : query;

        const data = await finalQuery.orderBy(desc(classAttendances.recordedAt));

        // Return empty array if no data
        if (!data || data.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Fetch teacher and recordedBy names separately
        const enrichedData = await Promise.all(
            data.map(async (item) => {
                let teacherName = null;
                let recordedByName = null;

                if (item.sessionTeacherId) {
                    const [teacher] = await db
                        .select({ name: users.name })
                        .from(users)
                        .where(eq(users.id, item.sessionTeacherId))
                        .limit(1);
                    teacherName = teacher?.name || null;
                }

                if (item.recordedBy) {
                    const [recorder] = await db
                        .select({ name: users.name })
                        .from(users)
                        .where(eq(users.id, item.recordedBy))
                        .limit(1);
                    recordedByName = recorder?.name || null;
                }

                return {
                    ...item,
                    teacherName,
                    recordedByName,
                };
            })
        );

        return NextResponse.json({ success: true, data: enrichedData });
    } catch (error) {
        console.error("Error fetching class attendances:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch class attendances",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
