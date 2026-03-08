import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const result = await db.query.classes.findFirst({
            where: eq(classes.id, id),
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
                    with: {
                        teachers: {
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
                    },
                },
            },
        });

        if (!result) {
            return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching attendance class details:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch class details",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
