import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    classAttendances,
    classSessions,
    classEnrollments,
    users,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

import { getAuthUser } from "@/lib/auth/getAuthUser";

// GET: Fetch attendance records for a session (with auto-generation)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        // Get session info
        const session = await db.query.classSessions.findFirst({
            where: eq(classSessions.id, sessionId),
            with: {
                schedule: {
                    with: {
                        class: true,
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const classId = session.schedule?.class?.id;
        if (!classId) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Check if attendance records already exist
        let attendanceRecords = await db
            .select({
                id: classAttendances.id,
                sessionId: classAttendances.sessionId,
                studentId: classAttendances.studentId,
                studentName: users.name,
                studentEmail: users.email,
                status: classAttendances.status,
                notes: classAttendances.notes,
                checkedInAt: classAttendances.checkedInAt,
                recordedAt: classAttendances.recordedAt,
            })
            .from(classAttendances)
            .innerJoin(users, eq(classAttendances.studentId, users.id))
            .where(eq(classAttendances.sessionId, sessionId));

        // If no records exist, auto-generate them (LAZY GENERATION)
        if (attendanceRecords.length === 0) {
            console.log(`Auto-generating attendance records for session ${sessionId}`);

            // Get all enrolled students
            const enrolledStudents = await db
                .select({
                    studentId: users.id,
                    studentName: users.name,
                    studentEmail: users.email,
                })
                .from(classEnrollments)
                .innerJoin(users, eq(classEnrollments.studentId, users.id))
                .where(eq(classEnrollments.classId, classId));

            if (enrolledStudents.length === 0) {
                return NextResponse.json({
                    session: {
                        id: session.id,
                        date: session.date,
                        status: session.status,
                        className: session.schedule?.class?.name,
                        classCode: session.schedule?.class?.code,
                    },
                    records: [],
                    message: "No students enrolled in this class",
                });
            }

            const user = await getAuthUser();
            if (!user) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
            const teacherId = user.id;

            // Create attendance records for all enrolled students (default: absent)
            const newRecords = enrolledStudents.map((student) => ({
                sessionId: sessionId,
                studentId: student.studentId,
                status: "absent" as const, // Default status
                recordedBy: teacherId,
                recordedAt: new Date(),
            }));

            await db.insert(classAttendances).values(newRecords);

            // Fetch the newly created records
            attendanceRecords = await db
                .select({
                    id: classAttendances.id,
                    sessionId: classAttendances.sessionId,
                    studentId: classAttendances.studentId,
                    studentName: users.name,
                    studentEmail: users.email,
                    status: classAttendances.status,
                    notes: classAttendances.notes,
                    checkedInAt: classAttendances.checkedInAt,
                    recordedAt: classAttendances.recordedAt,
                })
                .from(classAttendances)
                .innerJoin(users, eq(classAttendances.studentId, users.id))
                .where(eq(classAttendances.sessionId, sessionId));
        }

        return NextResponse.json({
            session: {
                id: session.id,
                date: session.date,
                status: session.status,
                className: session.schedule?.class?.name,
                classCode: session.schedule?.class?.code,
                startTime: session.schedule?.startTime,
                endTime: session.schedule?.endTime,
            },
            records: attendanceRecords.map((r) => ({
                id: r.id,
                sessionId: r.sessionId,
                studentId: r.studentId,
                studentName: r.studentName || "N/A",
                studentEmail: r.studentEmail,
                status: r.status,
                notes: r.notes,
                checkedInAt: r.checkedInAt,
                recordedAt: r.recordedAt,
            })),
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return NextResponse.json(
            { error: "Failed to fetch attendance records" },
            { status: 500 }
        );
    }
}

// PUT: Update attendance records
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body = await request.json();
        const { records } = body;

        if (!Array.isArray(records)) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const teacherId = user.id;

        // Update each record
        const updates = records.map(async (record: {
            id: string;
            status: "present" | "late" | "absent";
            notes?: string;
            checkedInAt?: string | Date;
        }) => {
            const updateData: {
                status: "present" | "late" | "absent";
                notes: string | null;
                recordedBy: string;
                updatedAt: Date;
                checkedInAt?: Date | null;
            } = {
                status: record.status,
                notes: record.notes || null,
                recordedBy: teacherId,
                updatedAt: new Date(),
            };

            // Set checkedInAt for present/late
            if (record.status === "present" || record.status === "late") {
                if (!record.checkedInAt) {
                    updateData.checkedInAt = new Date();
                }
            } else {
                updateData.checkedInAt = null;
            }

            return db
                .update(classAttendances)
                .set(updateData)
                .where(
                    and(
                        eq(classAttendances.id, record.id),
                        eq(classAttendances.sessionId, sessionId)
                    )
                );
        });

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: "Attendance records updated successfully",
            updatedCount: records.length,
        });
    } catch (error) {
        console.error("Error updating attendance records:", error);
        return NextResponse.json(
            { error: "Failed to update attendance records" },
            { status: 500 }
        );
    }
}
