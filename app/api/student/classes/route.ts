import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { classes, classEnrollments, users, teacherClasses } from "@/db/schema";
import { eq, inArray, and, ne } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 1. Get current student ID
        const [student] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (!student) {
            return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        }

        // 2. Get enrolled classes
        const myEnrollments = await db
            .select({
                classId: classEnrollments.classId,
                enrolledAt: classEnrollments.enrolledAt
            })
            .from(classEnrollments)
            .where(eq(classEnrollments.studentId, student.id));

        const classIds = myEnrollments.map(e => e.classId);

        if (classIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 3. Get Class Details
        const classesData = await db
            .select({
                id: classes.id,
                name: classes.name,
                code: classes.code,
                description: classes.description,
                // bannerUrl and imgUrl do not exist in schema, so we omit them or return null placeholders if needed by frontend types
            })
            .from(classes)
            .where(inArray(classes.id, classIds));

        // 4. Get Teachers for these classes
        const teachersData = await db
            .select({
                classId: teacherClasses.classId,
                name: users.name,
                image: users.image,
            })
            .from(teacherClasses)
            .innerJoin(users, eq(teacherClasses.teacherId, users.id))
            .where(inArray(teacherClasses.classId, classIds));

        // 5. Get Classmates (other students)
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
                    // ne(classEnrollments.studentId, student.id) // Optionally exclude self
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
                // Add placeholder functionality for images since not in DB
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
