import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
    assignmentSubmissions,
    assignments,
    users,
    classEnrollments
} from "@/db/schema";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id: assignmentId } = await params;

        // Get current teacher
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

        if (!currentUser || currentUser.role !== "TEACHER") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        // Verify teacher owns this assignment
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(
                and(
                    eq(assignments.id, assignmentId),
                    eq(assignments.teacherId, currentUser.id)
                )
            )
            .limit(1);

        if (!assignment) {
            return NextResponse.json({ success: false, message: "Assignment not found or not yours" }, { status: 404 });
        }

        // Get all enrolled students in this class
        const enrolledStudents = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(classEnrollments.studentId, users.id))
            .where(eq(classEnrollments.classId, assignment.classId));

        // Get all submissions for this assignment
        const submissions = await db
            .select({
                id: assignmentSubmissions.id,
                studentId: assignmentSubmissions.studentId,
                content: assignmentSubmissions.content,
                attachments: assignmentSubmissions.attachments,
                status: assignmentSubmissions.status,
                score: assignmentSubmissions.score,
                feedback: assignmentSubmissions.feedback,
                submittedAt: assignmentSubmissions.submittedAt,
                gradedAt: assignmentSubmissions.gradedAt,
                gradedBy: assignmentSubmissions.gradedBy,
            })
            .from(assignmentSubmissions)
            .where(eq(assignmentSubmissions.assignmentId, assignmentId));

        // Merge students with their submissions
        const submissionsWithStudents = enrolledStudents.map(student => {
            const submission = submissions.find(s => s.studentId === student.id);
            return {
                student,
                submission: submission || null
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                assignment: {
                    id: assignment.id,
                    title: assignment.title,
                    maxScore: assignment.maxScore,
                },
                submissions: submissionsWithStudents
            }
        });

    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
