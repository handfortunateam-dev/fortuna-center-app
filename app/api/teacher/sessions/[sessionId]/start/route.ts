import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classSessions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { sessionId } = await params;

        // Get current user
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

        if (!currentUser || currentUser.role !== "TEACHER") {
            return NextResponse.json(
                { success: false, message: "Forbidden - Teacher access required" },
                { status: 403 }
            );
        }

        // Update session status to in_progress
        const [updatedSession] = await db
            .update(classSessions)
            .set({
                status: "in_progress",
                updatedAt: new Date(),
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
            message: "Session started successfully",
            data: updatedSession,
        });
    } catch (error) {
        console.error("Error starting session:", error);
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
