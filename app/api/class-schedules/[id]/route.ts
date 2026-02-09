import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classSchedules, scheduleTeachers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Single schedule
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const [schedule] = await db
        .select()
        .from(classSchedules)
        .where(eq(classSchedules.id, id))
        .limit(1);

    if (!schedule) {
        return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
    }

    // Fetch teachers for this schedule
    const teachers = await db
        .select({
            id: users.id,
            name: users.name,
            image: users.image,
        })
        .from(scheduleTeachers)
        .leftJoin(users, eq(scheduleTeachers.teacherId, users.id))
        .where(eq(scheduleTeachers.scheduleId, id));

    return NextResponse.json({ success: true, data: { ...schedule, teachers } });
}

// PATCH - Update schedule (for drag & drop, or full edit with teachers)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { teacherIds, ...scheduleData } = body;

    const result = await db.transaction(async (tx) => {
        // Update schedule fields if any
        const [updated] = await tx
            .update(classSchedules)
            .set({ ...scheduleData, updatedAt: new Date() })
            .where(eq(classSchedules.id, id))
            .returning();

        // Update teachers if provided
        if (teacherIds !== undefined) {
            // Delete old assignments
            await tx.delete(scheduleTeachers).where(eq(scheduleTeachers.scheduleId, id));

            // Insert new assignments
            if (teacherIds.length > 0) {
                const { userId: clerkUserId } = await auth();
                let assignedBy: string | undefined;
                if (clerkUserId) {
                    const [user] = await tx.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
                    assignedBy = user?.id;
                }

                await tx.insert(scheduleTeachers).values(
                    teacherIds.map((tid: string) => ({
                        scheduleId: id,
                        teacherId: tid,
                        assignedBy: assignedBy,
                    }))
                );
            }
        }

        return updated;
    });

    return NextResponse.json({ success: true, data: result });
}

// DELETE - Delete schedule (CASCADE handles schedule_teachers)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await db.delete(classSchedules).where(eq(classSchedules.id, id));

    return NextResponse.json({ success: true, message: "Schedule deleted" });
}
