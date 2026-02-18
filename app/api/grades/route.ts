import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
    assignments,
    assignmentSubmissions,
    classes,
    classEnrollments,
    users
} from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Get DB user to check role
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        // Parse Query Params
        const searchParams = request.nextUrl.searchParams;
        const classId = searchParams.get("classId");

        if (!classId) {
            return NextResponse.json({ success: false, message: "Class ID required" }, { status: 400 });
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

        // Get Assignments for this Class
        const classAssignments = await db
            .select()
            .from(assignments)
            .where(eq(assignments.classId, classId))
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
        console.error("Error fetching grades:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
