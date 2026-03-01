
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

import { classes } from "@/db/schema/class.schema";
import { classEnrollments } from "@/db/schema/class-enrollment.schema";
import { teacherClasses } from "@/db/schema/teacher-class.schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { UserRole } from "@/enums/common";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Get the currently logged-in teacher
        const authUser = await getAuthUser();

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        if (authUser.role !== UserRole.TEACHER) {
            return NextResponse.json({ error: "Forbidden. Only teachers can access this resource." }, { status: 403 });
        }

        const { id: classId } = await params;

        // 2. Verify teacher is assigned to this class
        const assignment = await db.query.teacherClasses.findFirst({
            where: and(
                eq(teacherClasses.teacherId, authUser.id),
                eq(teacherClasses.classId, classId)
            )
        });

        if (!assignment) {
            return NextResponse.json({ error: "Forbidden. You are not assigned to this class." }, { status: 403 });
        }

        // 3. Fetch Class Details
        const classDetails = await db.query.classes.findFirst({
            where: eq(classes.id, classId)
        });

        if (!classDetails) {
            return NextResponse.json({ error: "Class not found." }, { status: 404 });
        }

        // 4. Fetch Enrolled Students
        const enrollments = await db.query.classEnrollments.findMany({
            where: eq(classEnrollments.classId, classId),
            with: {
                student: {
                    with: {
                        user: true
                    }
                }
            }
        });

        const studentsList = enrollments.map(e => {
            const student = e.student;
            const user = student.user;

            // Construct full name from student table if user name is missing
            const fullName = user?.name ||
                [student.firstName, student.middleName, student.lastName]
                    .filter(Boolean)
                    .join(" ");

            return {
                id: student.id,
                name: fullName || "Unknown Student",
                email: user?.email || student.email || "No email",
                image: user?.image || null,
                enrolledAt: e.enrolledAt
            };
        });

        return NextResponse.json({
            ...classDetails,
            students: studentsList
        });

    } catch (error) {
        console.error("Error fetching class details:", error);
        return NextResponse.json(
            { error: "Failed to fetch class details" },
            { status: 500 }
        );
    }
}
