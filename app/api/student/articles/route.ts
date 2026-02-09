import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { posts, users, postCategories, postTags, postToCategories, postToTags } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
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
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
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
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const validated = createArticleSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ success: false, message: "Invalid data", errors: validated.error.flatten() }, { status: 400 });
        }

        const { title, content, excerpt, coverImage, status, categoryIds, tags } = validated.data;

        // Use transaction to ensure data integrity
        const result = await db.transaction(async (tx) => {
            // 1. Create Post
            const [newPost] = await tx.insert(posts).values({
                title: title,
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
                // Verify categories exist? Optional but good practice.
                // For now, assume IDs are valid or foreign key constraint will fail/ignore?
                // Drizzle insert doesn't auto-check unless configured. DB will throw if FK invalid.
                // We'll trust the input for now or catch the error.

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
                // We assume 'tags' is an array of tag NAMES.
                // We need to find existing tags or create new ones.
                const processedTagIds: string[] = [];

                for (const tagName of tags) {
                    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                    // Check if exists
                    const [existingTag] = await tx.select().from(postTags).where(eq(postTags.slug, slug)).limit(1);

                    if (existingTag) {
                        processedTagIds.push(existingTag.id);
                    } else {
                        // Create new tag
                        const [newTag] = await tx.insert(postTags).values({
                            name: tagName,
                            slug: slug,
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
