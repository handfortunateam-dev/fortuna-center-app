import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { lessons, classes, teacherClasses, users } from "@/db/schema";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";

// ─── GET /api/lessons ─────────────────────────────────────────────
// Admin endpoint: returns lessons grouped by class, with teacher &
// material info. Supports ?q= search and ?classId= filter.
// Also supports ?view=grouped to return data grouped by class.
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q");
        const classId = searchParams.get("classId");
        const view = searchParams.get("view"); // "grouped" | null

        const filters = [];

        if (q) {
            filters.push(ilike(lessons.title, `%${q}%`));
        }
        if (classId) {
            filters.push(eq(lessons.classId, classId));
        }

        const where = filters.length ? and(...filters) : undefined;

        // Count materials per lesson via subquery
        const materialCountSq = db
            .select({
                lessonId: lessonMaterials.lessonId,
                count: sql<number>`count(*)`.as("count"),
            })
            .from(lessonMaterials)
            .groupBy(lessonMaterials.lessonId)
            .as("material_count");

        const data = await db
            .select({
                id: lessons.id,
                title: lessons.title,
                description: lessons.description,
                classId: lessons.classId,
                className: classes.name,
                classCode: classes.code,
                order: lessons.order,
                publishedAt: lessons.publishedAt,
                materialCount: sql<number>`coalesce(${materialCountSq.count}, 0)`.mapWith(Number),
                createdAt: lessons.createdAt,
                updatedAt: lessons.updatedAt,
            })
            .from(lessons)
            .leftJoin(classes, eq(lessons.classId, classes.id))
            .leftJoin(materialCountSq, eq(lessons.id, materialCountSq.lessonId))
            .where(where)
            .orderBy(desc(lessons.createdAt));

        // If "grouped" view requested, group by class with teacher info
        if (view === "grouped") {
            // Get all classes that have lessons
            const classIds = [...new Set(data.map((l) => l.classId))];

            // Fetch teacher assignments for these classes
            const teacherAssignments = classIds.length
                ? await db
                    .select({
                        classId: teacherClasses.classId,
                        teacherName: users.name,
                        teacherImage: users.image,
                    })
                    .from(teacherClasses)
                    .leftJoin(users, eq(teacherClasses.teacherId, users.id))
                    .where(
                        classIds.length === 1
                            ? eq(teacherClasses.classId, classIds[0])
                            : sql`${teacherClasses.classId} IN (${sql.join(
                                classIds.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                    )
                : [];

            // Build a map: classId -> teachers[]
            const teacherMap: Record<string, { name: string; image: string | null }[]> = {};
            for (const ta of teacherAssignments) {
                if (!teacherMap[ta.classId]) teacherMap[ta.classId] = [];
                if (ta.teacherName) {
                    teacherMap[ta.classId].push({
                        name: ta.teacherName,
                        image: ta.teacherImage,
                    });
                }
            }

            // Group lessons by class
            const grouped: Record<string, {
                classId: string;
                className: string | null;
                classCode: string | null;
                teachers: { name: string; image: string | null }[];
                lessons: typeof data;
                totalMaterials: number;
            }> = {};

            for (const lesson of data) {
                if (!grouped[lesson.classId]) {
                    grouped[lesson.classId] = {
                        classId: lesson.classId,
                        className: lesson.className,
                        classCode: lesson.classCode,
                        teachers: teacherMap[lesson.classId] || [],
                        lessons: [],
                        totalMaterials: 0,
                    };
                }
                grouped[lesson.classId].lessons.push(lesson);
                grouped[lesson.classId].totalMaterials += lesson.materialCount;
            }

            return NextResponse.json({
                success: true,
                data: Object.values(grouped),
            });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch lessons",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
