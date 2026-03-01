import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { assignments, assignmentSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema/users.schema";

export async function GET(
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
                    eq(assignmentSubmissions.studentId, user.id)
                )
            )
            .limit(1);

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
