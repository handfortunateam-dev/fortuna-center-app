import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
    assignments,
    classes,
    classEnrollments,
    assignmentSubmissions
} from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get current student ID from DB
        const [student] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (!student) {
            return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        }

        // 2. Get enrolled class IDs
        const enrollments = await db
            .select({ classId: classEnrollments.classId })
            .from(classEnrollments)
            .where(eq(classEnrollments.studentId, student.id));

        const classIds = enrollments.map(e => e.classId);

        if (classIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 3. Fetch assignments for these classes + submission status
        // We want all assignments where classId is in 'classIds'
        // AND we want to join with submission to see if THIS student has submitted.

        const rawAssignments = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                dueDate: assignments.dueDate,
                classId: assignments.classId,
                className: classes.name,
                status: assignments.status, // Assignment status
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
                    eq(assignmentSubmissions.studentId, student.id)
                )
            )
            .where(
                and(
                    inArray(assignments.classId, classIds),
                    eq(assignments.status, "published") // Only show published assignments? Usually yes.
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
