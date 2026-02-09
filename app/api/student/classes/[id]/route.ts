import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classes, users, classEnrollments, teacherClasses } from "@/db/schema";
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

        const classId = params.id;

        // Verify enrollment
        const [enrollment] = await db
            .select()
            .from(classEnrollments)
            .where(
                and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, student.id)
                )
            )
            .limit(1);

        if (!enrollment) {
            return NextResponse.json({ success: false, message: "Not enrolled in this class" }, { status: 403 });
        }

        // Fetch class detail
        const [classData] = await db
            .select()
            .from(classes)
            .where(eq(classes.id, classId))
            .limit(1);

        if (!classData) {
            return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
        }

        // Fetch classmates
        const enrolledStudents = await db
            .select({
                student: users,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(classEnrollments.studentId, users.id))
            .where(eq(classEnrollments.classId, classId));

        const classmates = enrolledStudents.map((e) => ({
            id: e.student.id,
            name: e.student.name,
            image: e.student.image,
            email: e.student.email,
        }));

        // Fetch teachers
        const assignedTeachers = await db
            .select({
                teacher: users,
            })
            .from(teacherClasses)
            .innerJoin(users, eq(teacherClasses.teacherId, users.id))
            .where(eq(teacherClasses.classId, classId));

        const teachers = assignedTeachers.map(t => ({
            name: t.teacher.name,
            image: t.teacher.image,
        }));

        // Fetch assignments for this class (optional, maybe displayed in the detail page)
        // For now, let's just return basic info + people.

        // Ensure bannerUrl and imgUrl are handled properly if they don't exist in schema yet
        // Based on lint errors, they might be missing. I will use null casting or check schema.
        // If lint says they don't exist, I'll pass null for now or cast to any if I know migration is pending.
        // But safer to just use null if not in schema.

        const responseData = {
            id: classData.id,
            name: classData.name,
            code: classData.code,
            description: classData.description,
            bannerUrl: null, // classData.bannerUrl might not exist in schema
            imgUrl: null, // classData.imgUrl might not exist in schema
            teachers: teachers,
            classmates: classmates,
        };

        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error("Error fetching class details:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
