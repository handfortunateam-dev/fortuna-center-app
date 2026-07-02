import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
    assignmentSubmissions,
    assignments
} from "@/db/schema";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ submissionId: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "TEACHER") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { submissionId } = await params;
        const body = await request.json();
        const { score, feedback } = body;

        // Get submission
        const [submission] = await db
            .select()
            .from(assignmentSubmissions)
            .where(eq(assignmentSubmissions.id, submissionId))
            .limit(1);

        if (!submission) {
            return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
        }

        // Verify teacher owns the assignment
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(
                and(
                    eq(assignments.id, submission.assignmentId),
                    eq(assignments.teacherId, user.id)
                )
            )
            .limit(1);

        if (!assignment) {
            return NextResponse.json({ success: false, message: "Not authorized to grade this submission" }, { status: 403 });
        }

        // Validate score
        if (score !== undefined && score !== null) {
            const maxScore = assignment.maxScore ?? 100; // Default to 100 if null
            if (score < 0 || score > maxScore) {
                return NextResponse.json({
                    success: false,
                    message: `Score must be between 0 and ${maxScore}`
                }, { status: 400 });
            }
        }

        // Update submission
        const [updated] = await db
            .update(assignmentSubmissions)
            .set({
                score: score !== undefined ? score : submission.score,
                feedback: feedback !== undefined ? feedback : submission.feedback,
                status: score !== undefined && score !== null ? "graded" : submission.status,
                gradedBy: user.id,
                gradedAt: new Date(),
            })
            .where(eq(assignmentSubmissions.id, submissionId))
            .returning();

        return NextResponse.json({
            success: true,
            data: updated,
            message: "Submission graded successfully"
        });

    } catch (error) {
        console.error("Error grading submission:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
