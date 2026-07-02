
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedMaterial = await db
            .update(lessonMaterials)
            .set(body)
            .where(eq(lessonMaterials.id, id))
            .returning();
        return NextResponse.json(updatedMaterial[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.delete(lessonMaterials).where(eq(lessonMaterials.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
    }
}
