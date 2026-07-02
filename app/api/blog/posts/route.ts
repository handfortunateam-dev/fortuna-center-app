import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");
        const status = searchParams.get("status") || "published"; // Default to published for public

        const filters = [];

        // Always filter by published status for public API
        filters.push(eq(posts.status, status as "draft" | "published" | "archived"));

        if (query) {
            filters.push(
                sql`(${ilike(posts.title, `%${query}%`)} OR ${ilike(
                    posts.excerpt,
                    `%${query}%`
                )})`
            );
        }

        const where = filters.length ? and(...filters) : undefined;

        // Fetch posts with full nested data for public display
        const rawData = await db.query.posts.findMany({
            where: where,
            orderBy: [desc(posts.createdAt)],
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                categories: {
                    with: {
                        category: {
                            columns: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        // Transform to public blog format with nested objects
        const data = rawData.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            status: post.status,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            // Nested objects for public blog
            author: {
                id: post.author?.id || "",
                name: post.author?.name || "Unknown",
                image: post.author?.image || null,
            },
            categories: post.categories.map((c) => ({
                id: c.category.id,
                name: c.category.name,
                slug: c.category.slug,
            })),
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("❌ Public Blog API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch blog posts"
            },
            { status: 500 }
        );
    }
}
