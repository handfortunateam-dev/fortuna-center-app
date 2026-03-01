import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { postCategories } from "@/db/schema/post-category.schema";

type CreateCategoryPayload = {
    name: string;
    slug: string;
    description?: string;
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        const filters = [];
        if (query) {
            filters.push(ilike(postCategories.name, `%${query}%`));
        }

        const where = filters.length ? and(...filters) : undefined;
        const data = await db
            .select()
            .from(postCategories)
            .where(where)
            .orderBy(desc(postCategories.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
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

        const body = (await request.json()) as CreateCategoryPayload;
        const { name, slug, description } = body;

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
            .from(postCategories)
            .where(eq(postCategories.slug, slug))
            .limit(1);

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category with this slug already exists",
                },
                { status: 409 }
            );
        }

        const [created] = await db
            .insert(postCategories)
            .values({
                name,
                slug,
                description,
            })
            .returning();

        return NextResponse.json(
            { success: true, data: created, message: "Category created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
