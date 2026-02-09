
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lesson.schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedLesson = await db
            .update(lessons)
            .set(body)
            .where(eq(lessons.id, id))
            .returning();
        return NextResponse.json(updatedLesson[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.delete(lessons).where(eq(lessons.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
    }
}
