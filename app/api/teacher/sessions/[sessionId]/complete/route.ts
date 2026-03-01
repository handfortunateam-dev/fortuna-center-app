import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

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

        // Update session status to completed
        const [updatedSession] = await db
            .update(classSessions)
            .set({
                status: "completed",
                actualEndTime: new Date(),
                completedBy: user.id
            })
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
            message: "Session marked as completed successfully",
            data: updatedSession,
        });
    } catch (error) {
        console.error("Error completing session:", error);
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
