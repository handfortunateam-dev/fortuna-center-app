import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import {
    assignments,
    classes,
    classEnrollments,
    assignmentSubmissions
} from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get enrolled class IDs
        const enrollments = await db
            .select({ classId: classEnrollments.classId })
            .from(classEnrollments)
            .where(eq(classEnrollments.studentId, user.id));

        const classIds = enrollments.map(e => e.classId);

        if (classIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 2. Fetch assignments for these classes + submission status
        const rawAssignments = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                dueDate: assignments.dueDate,
                classId: assignments.classId,
                className: classes.name,
                status: assignments.status,
                maxScore: assignments.maxScore,
                submissionStatus: assignmentSubmissions.status,
                submissionScore: assignmentSubmissions.score,
            })
            .from(assignments)
            .leftJoin(classes, eq(assignments.classId, classes.id))
            .leftJoin(
                assignmentSubmissions,
                and(
                    eq(assignments.id, assignmentSubmissions.assignmentId),
                    eq(assignmentSubmissions.studentId, user.id)
                )
            )
            .where(
                and(
                    inArray(assignments.classId, classIds),
                    eq(assignments.status, "published")
                )
            )
            .orderBy(desc(assignments.dueDate));

        return NextResponse.json({ success: true, data: rawAssignments });

    } catch (error) {
        console.error("Error fetching student assignments:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
