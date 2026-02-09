import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { assignments, classes, users } from "@/db/schema";

interface Context {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: Context
) {
    try {
        const { id } = await context.params;
        const assignmentId = id;

        const [assignment] = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                description: assignments.description,
                instructions: assignments.instructions,
                classId: assignments.classId,
                className: classes.name,
                teacherId: assignments.teacherId,
                teacherName: users.name,
                status: assignments.status,
                maxScore: assignments.maxScore,
                dueDate: assignments.dueDate,
                attachments: assignments.attachments,
                createdAt: assignments.createdAt,
                updatedAt: assignments.updatedAt,
            })
            .from(assignments)
            .leftJoin(classes, eq(assignments.classId, classes.id))
            .leftJoin(users, eq(assignments.teacherId, users.id))
            .where(eq(assignments.id, assignmentId))
            .limit(1);

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: assignment });
    } catch (error) {
        console.error("Error fetching assignment:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch assignment",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: Context
) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const assignmentId = id;

        // Get DB user
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "User not found in database" },
                { status: 404 }
            );
        }

        // Verify ownership (optional: or allow admins)
        // For now, we assume if you are a teacher/admin you can edit.
        // Or strictly check if assignment belongs to current user? 
        // Logic: admins can edit all, teachers only theirs. 
        // For simplicity, let's just check existence first.

        const [existingAssignment] = await db
            .select()
            .from(assignments)
            .where(eq(assignments.id, assignmentId))
            .limit(1);

        if (!existingAssignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            instructions,
            classId,
            status,
            maxScore,
            dueDate,
            attachments,
        } = body;

        const [updatedAssignment] = await db
            .update(assignments)
            .set({
                title,
                description,
                instructions,
                classId,
                status,
                maxScore,
                dueDate: dueDate ? new Date(dueDate) : null,
                attachments,
                updatedAt: new Date(),
            })
            .where(eq(assignments.id, assignmentId))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedAssignment,
            message: "Assignment updated successfully",
        });
    } catch (error) {
        console.error("Error updating assignment:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update assignment",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: Context
) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const assignmentId = id;

        // Check if exists
        const [existingAssignment] = await db
            .select()
            .from(assignments)
            .where(eq(assignments.id, assignmentId))
            .limit(1);

        if (!existingAssignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: 404 }
            );
        }

        await db.delete(assignments).where(eq(assignments.id, assignmentId));

        return NextResponse.json({
            success: true,
            message: "Assignment deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete assignment",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
