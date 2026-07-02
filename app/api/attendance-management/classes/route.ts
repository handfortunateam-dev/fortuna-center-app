import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql, ilike, or, exists, and, eq } from "drizzle-orm";
import { classes, teacherClasses, users, classSessions, classSchedules } from "@/db/schema";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    try {
        const whereClause = search ? or(
            ilike(classes.name, `%${search}%`),
            ilike(classes.code, `%${search}%`),
            ilike(classes.description, `%${search}%`),
            // Subquery to check if there's any teacher assigned to this class whose name matches the search
            exists(
                db.select()
                    .from(teacherClasses)
                    .innerJoin(users, eq(teacherClasses.teacherId, users.id))
                    .where(
                        and(
                            eq(teacherClasses.classId, classes.id),
                            ilike(users.name, `%${search}%`)
                        )
                    )
            )
        ) : undefined;

        // Get total count for pagination with search filter
        const totalCountResult = await db.select({ count: sql<number>`count(*)` })
            .from(classes)
            .where(whereClause);
        const totalCount = Number(totalCountResult[0]?.count || 0);

        const rawData = await db.query.classes.findMany({
            where: whereClause,
            limit: limit,
            offset: offset,
            with: {
                teacherClasses: {
                    with: {
                        teacher: {
                            columns: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                classSchedules: {
                    columns: {
                        id: true,
                        dayOfWeek: true,
                        startTime: true,
                        endTime: true,
                        location: true,
                    }
                },
            },
            // Use stable sorting by name AND id to prevent duplicate/skipped items during pagination
            orderBy: (classes, { asc }) => [asc(classes.name), asc(classes.id)],
        });

        // Enrich performance: fetch session count for each class
        const data = await Promise.all(rawData.map(async (cls) => {
            // Count sessions linked to this class via classSchedules
            const sessionCountResult = await db.select({ count: sql<number>`count(*)` })
                .from(classSessions)
                .innerJoin(classSchedules, eq(classSessions.scheduleId, classSchedules.id))
                .where(eq(classSchedules.classId, cls.id));

            return {
                ...cls,
                sessionCount: Number(sessionCountResult[0]?.count || 0)
            };
        }));

        const hasMore = offset + data.length < totalCount;

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                totalCount,
                page,
                limit,
                hasMore,
                nextPage: hasMore ? page + 1 : null,
            }
        });
    } catch (error) {
        console.error("Error fetching attendance classes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch classes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
