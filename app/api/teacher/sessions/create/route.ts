import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    classSessions,
    classSchedules,
    teacherClasses,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const teacherId = user.id;

        const body = await request.json();
        const { scheduleId, date, notes } = body;

        // Validate: Check if teacher is assigned to this class
        const schedule = await db.query.classSchedules.findFirst({
            where: eq(classSchedules.id, scheduleId),
        });

        if (!schedule) {
            return NextResponse.json(
                { error: "Schedule not found" },
                { status: 404 }
            );
        }

        // Check if teacher is assigned to this class
        const teacherAssignment = await db.query.teacherClasses.findFirst({
            where: and(
                eq(teacherClasses.teacherId, teacherId),
                eq(teacherClasses.classId, schedule.classId)
            ),
        });

        if (!teacherAssignment) {
            return NextResponse.json(
                { error: "You are not assigned to this class" },
                { status: 403 }
            );
        }

        // Check if session already exists for this date
        const existingSession = await db.query.classSessions.findFirst({
            where: and(
                eq(classSessions.scheduleId, scheduleId),
                eq(classSessions.date, date)
            ),
        });

        if (existingSession) {
            return NextResponse.json(
                { error: "Session already exists for this date" },
                { status: 409 }
            );
        }

        // Create new session
        const [newSession] = await db
            .insert(classSessions)
            .values({
                scheduleId,
                teacherId,
                date,
                status: "scheduled",
                notes: notes || null,
                generatedBy: teacherId,
                generatedAt: new Date(),
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: "Session created successfully",
            session: {
                id: newSession.id,
                date: newSession.date,
                status: newSession.status,
                scheduleId: newSession.scheduleId,
            },
        });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}
