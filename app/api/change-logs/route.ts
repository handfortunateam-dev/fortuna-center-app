import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { changelogs, users } from "@/db/schema";
import { eq, desc, asc, ilike, or, isNull } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const search = url.searchParams.get("search") || "";
        const type = url.searchParams.get("type") || "";
        const isPublished = url.searchParams.get("isPublished") || "";
        const limit = url.searchParams.get("limit") || "";

        let conditions: any[] = [];

        // Default: don't show deleted
        conditions.push(isNull(changelogs.deletedAt));

        if (search) {
            conditions.push(
                or(
                    ilike(changelogs.title, `%${search}%`),
                    ilike(changelogs.content, `%${search}%`)
                )
            );
        }

        if (type) {
            conditions.push(eq(changelogs.type, type as any));
        }

        if (isPublished) {
            conditions.push(eq(changelogs.isPublished, isPublished === "true"));
        }

        const { and } = await import("drizzle-orm");
        const queryConditions = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db
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
            .where(queryConditions)
            .orderBy(desc(changelogs.createdAt))
            .limit(limit ? parseInt(limit) : 1000);

        return NextResponse.json({ data, totalCount: data.length });
    } catch (error: any) {
        console.error("Error fetching changelogs:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== "DEVELOPER" && user.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, type, version, isPublished } = body;

        const [newLog] = await db
            .insert(changelogs)
            .values({
                title,
                content,
                type,
                version,
                isPublished: isPublished ?? false,
                authorId: user.id
            })
            .returning();

        return NextResponse.json({ success: true, data: newLog });
    } catch (error: any) {
        console.error("Error creating changelog:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
