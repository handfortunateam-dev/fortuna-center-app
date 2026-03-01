import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { ClassSessionStatus } from "@/features/lms/sessions/constants";


const ClassSessionStatus = {
    SCHEDULED: "scheduled",
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

interface ClassSessionUpdate {
    status: typeof ClassSessionStatus[keyof typeof ClassSessionStatus];
    updatedAt: Date;
    actualStartTime?: Date;
    startedBy?: string;
    actualEndTime?: Date;
    completedBy?: string;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (user.role !== "TEACHER") {
            return NextResponse.json(
                { success: false, message: "Forbidden - Teacher access required" },
                { status: 403 }
            );
        }

        const { sessionId } = await params;
        const body = await request.json();
        const { status } = body;

        // Validation for valid status enum
        const validStatuses = ['scheduled', 'not_started', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status value" },
                { status: 400 }
            );
        }

        const updates: ClassSessionUpdate = {
            status,
            updatedAt: new Date(),
        };

        // Specific fields based on status
        if (status === "in_progress") {
            updates.actualStartTime = new Date();
            updates.startedBy = user.id;
        } else if (status === "completed") {
            updates.actualEndTime = new Date();
            updates.completedBy = user.id;
        }

        const [updatedSession] = await db
            .update(classSessions)
            .set(updates)
            .where(eq(classSessions.id, sessionId))
            .returning();

        if (!updatedSession) {
            return NextResponse.json(
                { success: false, message: "Session not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Session status updated to ${status}`,
            data: updatedSession,
        });
    } catch (error) {
        console.error("Error updating session status:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
