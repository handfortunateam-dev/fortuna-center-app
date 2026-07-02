import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classes, classEnrollments, teacherClasses } from "@/db/schema";
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

        const classId = params.id;

        // Verify enrollment
        const [enrollment] = await db
            .select()
            .from(classEnrollments)
            .where(
                and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, user.id)
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

        const responseData = {
            id: classData.id,
            name: classData.name,
            code: classData.code,
            description: classData.description,
            bannerUrl: null,
            imgUrl: null,
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
