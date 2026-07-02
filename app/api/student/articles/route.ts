import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { posts, postCategories, postTags, postToCategories, postToTags } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// Schema for validation
const createArticleSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    coverImage: z.string().nullable().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    categoryIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(), // Array of tag names or IDs
});

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.authorId, user.id))
            .orderBy(desc(posts.createdAt));

        return NextResponse.json({ success: true, data: userPosts });
    } catch (error) {
        console.error("Fetch articles error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validated = createArticleSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ success: false, message: "Invalid data", errors: validated.error.flatten() }, { status: 400 });
        }

        const { title, content, excerpt, coverImage, status, categoryIds, tags } = validated.data;

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "") + "-" + Date.now();

        // Use transaction to ensure data integrity
        const result = await db.transaction(async (tx) => {
            // 1. Create Post
            const [newPost] = await tx.insert(posts).values({
                title: title,
                slug: slug,
                content: content,
                excerpt: excerpt || null,
                coverImage: coverImage || null,
                status: status as "draft" | "published",
                authorId: user.id,
                viewCount: 0,
                likeCount: 0,
            }).returning();

            // 2. Handle Categories
            if (categoryIds && categoryIds.length > 0) {
                const categoryLinks = categoryIds.map(catId => ({
                    postId: newPost.id,
                    categoryId: catId,
                }));

                if (categoryLinks.length > 0) {
                    await tx.insert(postToCategories).values(categoryLinks);
                }
            }

            // 3. Handle Tags
            if (tags && tags.length > 0) {
                const processedTagIds: string[] = [];

                for (const tagName of tags) {
                    const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                    const [existingTag] = await tx.select().from(postTags).where(eq(postTags.slug, tagSlug)).limit(1);

                    if (existingTag) {
                        processedTagIds.push(existingTag.id);
                    } else {
                        const [newTag] = await tx.insert(postTags).values({
                            name: tagName,
                            slug: tagSlug,
                        }).returning();
                        processedTagIds.push(newTag.id);
                    }
                }

                if (processedTagIds.length > 0) {
                    const tagLinks = processedTagIds.map(tagId => ({
                        postId: newPost.id,
                        tagId: tagId,
                    }));
                    await tx.insert(postToTags).values(tagLinks);
                }
            }

            return newPost;
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Create article error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
