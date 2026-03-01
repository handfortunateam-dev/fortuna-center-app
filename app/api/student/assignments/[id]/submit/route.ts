import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { assignmentSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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
                    eq(assignmentSubmissions.studentId, user.id)
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
                    studentId: user.id,
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
