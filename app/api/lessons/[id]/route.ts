import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { lessons } from "@/db/schema/lesson.schema";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";

// GET /api/lessons/[id] — Get a single lesson with its materials
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, id))
            .limit(1);

        if (!lesson) {
            return NextResponse.json(
                { success: false, message: "Lesson not found" },
                { status: 404 }
            );
        }

        const materials = await db
            .select()
            .from(lessonMaterials)
            .where(eq(lessonMaterials.lessonId, id))
            .orderBy(asc(lessonMaterials.order));

        return NextResponse.json({
            success: true,
            data: { ...lesson, materials },
        });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch lesson",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/lessons/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(lessons)
            .where(eq(lessons.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Lesson not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Lesson deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete lesson",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
