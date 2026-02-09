import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, assignmentSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [student] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (!student) {
            return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        }

        const assignmentId = params.id;
        const body = await request.json();
        const { content, attachments } = body;

        // Check if submission already exists
        const [existingSubmission] = await db
            .select()
            .from(assignmentSubmissions)
            .where(
                and(
                    eq(assignmentSubmissions.assignmentId, assignmentId),
                    eq(assignmentSubmissions.studentId, student.id)
                )
            )
            .limit(1);

        if (existingSubmission) {
            // Update existing
            const [updated] = await db
                .update(assignmentSubmissions)
                .set({
                    content,
                    attachments,
                    status: 'submitted',
                    submittedAt: new Date(),
                })
                .where(eq(assignmentSubmissions.id, existingSubmission.id))
                .returning();

            return NextResponse.json({ success: true, data: updated });
        } else {
            // Create new
            const [created] = await db
                .insert(assignmentSubmissions)
                .values({
                    assignmentId,
                    studentId: student.id,
                    content,
                    attachments,
                    status: 'submitted',
                    submittedAt: new Date(),
                })
                .returning();

            return NextResponse.json({ success: true, data: created });
        }

    } catch (error) {
        console.error("Error submitting assignment:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
