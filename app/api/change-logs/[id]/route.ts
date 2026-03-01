import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { changelogs, users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const [log] = await db
            .select({
                id: changelogs.id,
                title: changelogs.title,
                content: changelogs.content,
                type: changelogs.type,
                version: changelogs.version,
                isPublished: changelogs.isPublished,
                createdAt: changelogs.createdAt,
                updatedAt: changelogs.updatedAt,
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(changelogs)
            .leftJoin(users, eq(changelogs.authorId, users.id))
            .where(and(eq(changelogs.id, id), isNull(changelogs.deletedAt)))
            .limit(1);

        if (!log) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: log });
    } catch (error: any) {
        console.error("Error fetching changelog:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== "DEVELOPER" && user.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { title, content, type, version, isPublished } = body;

        const [updatedLog] = await db
            .update(changelogs)
            .set({
                title,
                content,
                type,
                version,
                isPublished,
                updatedAt: new Date(),
            })
            .where(and(eq(changelogs.id, id), isNull(changelogs.deletedAt)))
            .returning();

        if (!updatedLog) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedLog });
    } catch (error: any) {
        console.error("Error updating changelog:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== "DEVELOPER" && user.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const [deletedLog] = await db
            .update(changelogs)
            .set({ deletedAt: new Date() })
            .where(and(eq(changelogs.id, id), isNull(changelogs.deletedAt)))
            .returning();

        if (!deletedLog) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedLog });
    } catch (error: any) {
        console.error("Error deleting changelog:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
