import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classSessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update session status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userId: clerkUserId } = await auth();

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId!)).limit(1);

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
