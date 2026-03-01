import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { assignments, classes } from "@/db/schema";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q");
        const classId = searchParams.get("classId");
        const teacherId = searchParams.get("teacherId");
        const status = searchParams.get("status");

        const filters = [];

        if (q) {
            filters.push(ilike(assignments.title, `%${q}%`));
        }
        if (classId) {
            filters.push(eq(assignments.classId, classId));
        }
        if (teacherId) {
            filters.push(eq(assignments.teacherId, teacherId));
        }
        if (status) {
            filters.push(eq(assignments.status, status as any));
        }

        const where = filters.length ? and(...filters) : undefined;

        const data = await db
            .select({
                id: assignments.id,
                title: assignments.title,
                description: assignments.description,
                instructions: assignments.instructions,
                classId: assignments.classId,
                className: classes.name,
                teacherId: assignments.teacherId,
                teacherName: users.name,
                status: assignments.status,
                maxScore: assignments.maxScore,
                dueDate: assignments.dueDate,
                attachments: assignments.attachments,
                createdAt: assignments.createdAt,
                updatedAt: assignments.updatedAt,
            })
            .from(assignments)
            .leftJoin(classes, eq(assignments.classId, classes.id))
            .leftJoin(users, eq(assignments.teacherId, users.id))
            .where(where)
            .orderBy(desc(assignments.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch assignments",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            instructions,
            classId,
            status,
            maxScore,
            dueDate,
            attachments,
        } = body;

        if (!title || !classId) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const [newAssignment] = await db
            .insert(assignments)
            .values({
                title,
                description,
                instructions,
                classId,
                teacherId: user.id,
                status: status || "draft",
                maxScore: maxScore || 100,
                dueDate: dueDate ? new Date(dueDate) : null,
                attachments: attachments || [],
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: newAssignment,
                message: "Assignment created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating assignment:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create assignment",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
