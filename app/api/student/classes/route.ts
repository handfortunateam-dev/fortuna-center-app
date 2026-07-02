import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classes, classEnrollments, teacherClasses } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get enrolled classes
        const myEnrollments = await db
            .select({
                classId: classEnrollments.classId,
                enrolledAt: classEnrollments.enrolledAt
            })
            .from(classEnrollments)
            .where(eq(classEnrollments.studentId, user.id));

        const classIds = myEnrollments.map(e => e.classId);

        if (classIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 2. Get Class Details
        const classesData = await db
            .select({
                id: classes.id,
                name: classes.name,
                code: classes.code,
                description: classes.description,
            })
            .from(classes)
            .where(inArray(classes.id, classIds));

        // 3. Get Teachers for these classes
        const teachersData = await db
            .select({
                classId: teacherClasses.classId,
                name: users.name,
                image: users.image,
            })
            .from(teacherClasses)
            .innerJoin(users, eq(teacherClasses.teacherId, users.id))
            .where(inArray(teacherClasses.classId, classIds));

        // 4. Get Classmates (other students)
        const allEnrollmentsInMyClasses = await db
            .select({
                classId: classEnrollments.classId,
                studentId: classEnrollments.studentId,
                name: users.name,
                image: users.image,
                email: users.email,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(classEnrollments.studentId, users.id))
            .where(
                and(
                    inArray(classEnrollments.classId, classIds),
                )
            );

        // Map everything together
        const result = classesData.map(cls => {
            const classmates = allEnrollmentsInMyClasses
                .filter(e => e.classId === cls.id)
                .map(e => ({
                    id: e.studentId,
                    name: e.name,
                    image: e.image,
                    email: e.email
                }));

            const teachers = teachersData
                .filter(t => t.classId === cls.id)
                .map(t => ({
                    name: t.name,
                    image: t.image
                }));

            return {
                ...cls,
                teachers,
                classmates,
                bannerUrl: null,
                imgUrl: null
            };
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Error fetching student classes:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
