import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { assignments, classes } from "@/db/schema";
import { users } from "@/db/schema/users.schema";

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
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const assignmentId = id;

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
        const user = await getAuthUser();
        if (!user) {
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
