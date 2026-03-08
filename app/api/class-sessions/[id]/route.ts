import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update session details (date, notes, etc.)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { date, notes, teacherId, status } = body;

        const updateData: any = {};
        if (date !== undefined) updateData.date = date;
        if (notes !== undefined) updateData.notes = notes;
        if (teacherId !== undefined) updateData.teacherId = teacherId;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: "No data provided for update" }, { status: 400 });
        }

        const [updated] = await db
            .update(classSessions)
            .set(updateData)
            .where(eq(classSessions.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error updating session:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update session",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
