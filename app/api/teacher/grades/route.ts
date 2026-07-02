import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
    assignments,
    assignmentSubmissions,
    classes,
    classEnrollments,
    teacherClasses
} from "@/db/schema";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "TEACHER") {
            return NextResponse.json({ success: false, message: "Forbidden - Teacher access only" }, { status: 403 });
        }

        // Parse Query Params
        const searchParams = request.nextUrl.searchParams;
        const classId = searchParams.get("classId");

        if (!classId) {
            return NextResponse.json({ success: false, message: "Class ID required" }, { status: 400 });
        }

        // Verify teacher teaches this class
        const [teacherClass] = await db
            .select()
            .from(teacherClasses)
            .where(
                and(
                    eq(teacherClasses.teacherId, user.id),
                    eq(teacherClasses.classId, classId)
                )
            )
            .limit(1);

        if (!teacherClass) {
            return NextResponse.json({ success: false, message: "You don't teach this class" }, { status: 403 });
        }

        // Get Class Details
        const [foundClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.id, classId))
            .limit(1);

        if (!foundClass) {
            return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
        }

        // Get Assignments for this Class (created by this teacher)
        const classAssignments = await db
            .select()
            .from(assignments)
            .where(
                and(
                    eq(assignments.classId, classId),
                    eq(assignments.teacherId, user.id)
                )
            )
            .orderBy(desc(assignments.createdAt));

        // Get Enrolled Students
        const enrolledStudents = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(classEnrollments.studentId, users.id))
            .where(eq(classEnrollments.classId, classId));

        let submissions: any[] = [];

        // Get Submissions if assignments and students exist
        if (classAssignments.length > 0 && enrolledStudents.length > 0) {
            const assignmentIds = classAssignments.map(a => a.id);
            const studentIds = enrolledStudents.map(s => s.id);

            submissions = await db
                .select()
                .from(assignmentSubmissions)
                .where(
                    and(
                        inArray(assignmentSubmissions.assignmentId, assignmentIds),
                        inArray(assignmentSubmissions.studentId, studentIds)
                    )
                )
                .orderBy(desc(assignmentSubmissions.submittedAt));
        }

        return NextResponse.json({
            success: true,
            data: {
                class: foundClass,
                assignments: classAssignments,
                students: enrolledStudents,
                submissions: submissions
            }
        });

    } catch (error) {
        console.error("Error fetching teacher grades:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
