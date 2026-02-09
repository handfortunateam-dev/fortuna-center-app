import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { assignments, users, assignmentSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
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

        // Fetch assignment details
        const [assignmentData] = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                description: assignments.description,
                instructions: assignments.instructions,
                maxScore: assignments.maxScore,
                dueDate: assignments.dueDate,
                status: assignments.status,
                classId: assignments.classId,
                teacherId: assignments.teacherId,
                teacherName: users.name,
                attachments: assignments.attachments,
            })
            .from(assignments)
            .leftJoin(users, eq(assignments.teacherId, users.id))
            .where(eq(assignments.id, assignmentId))
            .limit(1);

        if (!assignmentData) {
            return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
        }

        // Fetch student's submission if exists
        const [submissionData] = await db
            .select()
            .from(assignmentSubmissions)
            .where(
                and(
                    eq(assignmentSubmissions.assignmentId, assignmentId),
                    eq(assignmentSubmissions.studentId, student.id)
                )
            )
            .limit(1);

        // Transform submission attachments from old/new format schema if needed
        // Assuming the DB schema update applied, attachments is JSONB. 
        // If not applied yet, 'attachmentUrl' text might be there. We should handle both or assume update.
        // For now, let's proceed assuming we write to the new schema, but read safely.

        const responseData = {
            ...assignmentData,
            submission: submissionData ? {
                ...submissionData,
                attachments: submissionData.attachments || []
            } : null
        };

        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error("Error fetching assignment details:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
