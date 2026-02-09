import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, ilike, eq } from "drizzle-orm";
import { db } from "@/db";
import { postTags } from "@/db/schema/post-tag.schema";

type CreateTagPayload = {
    name: string;
    slug: string;
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        const filters = [];
        if (query) {
            filters.push(ilike(postTags.name, `%${query}%`));
        }

        const where = filters.length ? and(...filters) : undefined;
        const data = await db
            .select()
            .from(postTags)
            .where(where)
            .orderBy(desc(postTags.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch tags",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = (await request.json()) as CreateTagPayload;
        const { name, slug } = body;

        if (!name || !slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: name, slug",
                },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const [existing] = await db
            .select()
            .from(postTags)
            .where(eq(postTags.slug, slug))
            .limit(1);

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tag with this slug already exists",
                },
                { status: 409 }
            );
        }

        const [created] = await db
            .insert(postTags)
            .values({
                name,
                slug,
            })
            .returning();

        return NextResponse.json(
            { success: true, data: created, message: "Tag created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating tag:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create tag",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
