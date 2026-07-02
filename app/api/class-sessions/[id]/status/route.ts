import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update session status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = await getAuthUser();

    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const updateData: any = { status };

    // Track who changed status
    if (status === 'in_progress') {
        updateData.startedBy = user.id;
        updateData.actualStartTime = new Date();
    } else if (status === 'completed') {
        updateData.completedBy = user.id;
        updateData.actualEndTime = new Date();
    }

    const [updated] = await db
        .update(classSessions)
        .set(updateData)
        .where(eq(classSessions.id, id))
        .returning();

    return NextResponse.json({ success: true, data: updated });
}
