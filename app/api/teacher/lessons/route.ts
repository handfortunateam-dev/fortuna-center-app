
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessons } from "@/db/schema/lesson.schema";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
        return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    try {
        // 1. Fetch lessons first
        const classLessons = await db.select().from(lessons)
            .where(eq(lessons.classId, classId))
            .orderBy(asc(lessons.order));

        if (classLessons.length === 0) {
            return NextResponse.json([]);
        }

        const lessonIds = classLessons.map(l => l.id);

        // 2. Fetch materials for these lessons
        // Note: Drizzle 'inArray' should be used, but let's just fetch all for simplicity or use findMany if possible.
        // Using db.query.lessonMaterials.findMany with explicit where clause
        // We need to import 'inArray' from drizzle-orm

        // Let's use a simpler approach: Fetch materials where lessonId is in the list
        // But to avoid importing 'inArray' if not already imported, let's just use raw select or loop if small.
        // Actually, let's just use db.query.lessonMaterials if we can.

        // Better: just fetch all materials for these lessons.
        const allMaterials = await db.query.lessonMaterials.findMany({
            where: (materials, { inArray }) => inArray(materials.lessonId, lessonIds),
            orderBy: [asc(lessonMaterials.order)]
        });

        // 3. Attach materials to lessons
        const result = classLessons.map(lesson => ({
            ...lesson,
            materials: allMaterials.filter(m => m.lessonId === lesson.id) || []
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching lessons:", error);
        // Fallback or detailed error
        return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newLesson = await db.insert(lessons).values(body).returning();
        return NextResponse.json(newLesson[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
    }
}
