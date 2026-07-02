import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { classEnrollments, classes } from "@/db/schema";
import { lessons } from "@/db/schema/lesson.schema";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";
import { eq, asc, inArray, and, isNotNull } from "drizzle-orm";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("classId");

        // If classId is provided, verify student is enrolled in that class
        if (classId) {
            const enrollment = await db
                .select()
                .from(classEnrollments)
                .where(
                    and(
                        eq(classEnrollments.studentId, user.id),
                        eq(classEnrollments.classId, classId)
                    )
                )
                .limit(1);

            if (enrollment.length === 0) {
                return NextResponse.json({ success: false, message: "You are not enrolled in this class" }, { status: 403 });
            }

            // Fetch lessons for this class (only published)
            const classLessons = await db
                .select()
                .from(lessons)
                .where(
                    and(
                        eq(lessons.classId, classId),
                        isNotNull(lessons.publishedAt)
                    )
                )
                .orderBy(asc(lessons.order));

            if (classLessons.length === 0) {
                return NextResponse.json({ success: true, data: [] });
            }

            const lessonIds = classLessons.map(l => l.id);

            // Fetch published materials for these lessons
            const allMaterials = await db
                .select()
                .from(lessonMaterials)
                .where(
                    and(
                        inArray(lessonMaterials.lessonId, lessonIds),
                        isNotNull(lessonMaterials.publishedAt)
                    )
                )
                .orderBy(asc(lessonMaterials.order));

            // Attach materials to lessons
            const result = classLessons.map(lesson => ({
                ...lesson,
                materials: allMaterials.filter(m => m.lessonId === lesson.id)
            }));

            return NextResponse.json({ success: true, data: result });
        }

        // If no classId, return lessons from all enrolled classes
        const enrollments = await db
            .select({ classId: classEnrollments.classId })
            .from(classEnrollments)
            .where(eq(classEnrollments.studentId, user.id));

        const classIds = enrollments.map(e => e.classId);

        if (classIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Get class info
        const classesData = await db
            .select({
                id: classes.id,
                name: classes.name,
                code: classes.code
            })
            .from(classes)
            .where(inArray(classes.id, classIds));

        // Get all published lessons from enrolled classes
        const allLessons = await db
            .select()
            .from(lessons)
            .where(
                and(
                    inArray(lessons.classId, classIds),
                    isNotNull(lessons.publishedAt)
                )
            )
            .orderBy(asc(lessons.order));

        if (allLessons.length === 0) {
            return NextResponse.json({ success: true, data: classesData.map(c => ({ ...c, lessons: [] })) });
        }

        const lessonIds = allLessons.map(l => l.id);

        // Get published materials
        const allMaterials = await db
            .select()
            .from(lessonMaterials)
            .where(
                and(
                    inArray(lessonMaterials.lessonId, lessonIds),
                    isNotNull(lessonMaterials.publishedAt)
                )
            )
            .orderBy(asc(lessonMaterials.order));

        // Group lessons by class with materials
        const result = classesData.map(cls => ({
            ...cls,
            lessons: allLessons
                .filter(l => l.classId === cls.id)
                .map(lesson => ({
                    ...lesson,
                    materials: allMaterials.filter(m => m.lessonId === lesson.id)
                }))
        }));

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Error fetching student lessons:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
