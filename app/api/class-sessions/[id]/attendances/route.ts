import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classAttendances, classEnrollments, classSessions, classSchedules, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get attendances for a session
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: sessionId } = await params;

    // Get session with schedule to find class
    const [session] = await db
        .select()
        .from(classSessions)
        .leftJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
        .where(eq(classSessions.id, sessionId))
        .limit(1);

    if (!session) {
        return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    // Get enrolled students
    const enrollments = await db
        .select({
            studentId: classEnrollments.studentId,
            studentName: users.name,
        })
        .from(classEnrollments)
        .leftJoin(users, eq(classEnrollments.studentId, users.id))
        .where(eq(classEnrollments.classId, session.class_schedules!.classId));

    // Get existing attendance records
    const attendances = await db
        .select()
        .from(classAttendances)
        .where(eq(classAttendances.sessionId, sessionId));

    // Merge: show all enrolled students with their attendance status
    const result = enrollments.map(enrollment => {
        const attendance = attendances.find(a => a.studentId === enrollment.studentId);
        return {
            studentId: enrollment.studentId,
            studentName: enrollment.studentName,
            status: attendance?.status || 'absent',
            notes: attendance?.notes || null,
            checkedInAt: attendance?.checkedInAt || null,
        };
    });

    return NextResponse.json({ success: true, data: result });
}

// PUT - Bulk update attendances
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: sessionId } = await params;
    const { userId: clerkUserId } = await auth();

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId!)).limit(1);

    const body = await request.json();
    const { attendances } = body; // Array of { studentId, status, notes? }

    // Upsert each attendance
    for (const att of attendances) {
        const existing = await db
            .select()
            .from(classAttendances)
            .where(
                and(
                    eq(classAttendances.sessionId, sessionId),
                    eq(classAttendances.studentId, att.studentId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(classAttendances)
                .set({
                    status: att.status,
                    notes: att.notes,
                    checkedInAt: att.status === 'present' || att.status === 'late' ? new Date() : null,
                    updatedAt: new Date(),
                })
                .where(eq(classAttendances.id, existing[0].id));
        } else {
            await db.insert(classAttendances).values({
                sessionId,
                studentId: att.studentId,
                status: att.status,
                notes: att.notes,
                checkedInAt: att.status === 'present' || att.status === 'late' ? new Date() : null,
                recordedBy: user.id,
            });
        }
    }

    return NextResponse.json({ success: true, message: "Attendances updated" });
}
