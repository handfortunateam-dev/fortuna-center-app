import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, postToCategories, postToTags } from "@/db/schema";

type UpdatePostPayload = {
    title?: string;
    // slug?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    categoryIds?: string[];
    tagIds?: string[];
    authorId?: string;
    status?: "draft" | "published" | "archived";
    publishedAt?: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        // Using query builder for relational fetch
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, id),
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
                        category: true,
                    },
                },
                tags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = (await request.json()) as UpdatePostPayload;
        const {
            title,
            content,
            excerpt,
            coverImage,
            categoryIds,
            tagIds,
            authorId,
            status,
            publishedAt,
        } = body;

        const [existing] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        const result = await db.transaction(async (tx) => {
            const [updatedPost] = await tx
                .update(posts)
                .set({
                    ...(title && { title }),
                    ...(content && { content }),
                    ...(excerpt !== undefined && { excerpt }),
                    ...(coverImage !== undefined && { coverImage }),
                    ...(authorId && { authorId }),
                    ...(status && { status }),
                    ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
                    updatedAt: new Date(),
                })
                .where(eq(posts.id, id))
                .returning();

            if (categoryIds !== undefined) {
                // Delete existing
                await tx
                    .delete(postToCategories)
                    .where(eq(postToCategories.postId, id));

                // Insert new
                if (categoryIds.length > 0) {
                    await tx.insert(postToCategories).values(
                        categoryIds.map((catId) => ({
                            postId: id,
                            categoryId: catId,
                        }))
                    );
                }
            }

            if (tagIds !== undefined) {
                // Delete existing
                await tx
                    .delete(postToTags)
                    .where(eq(postToTags.postId, id));

                // Insert new
                if (tagIds.length > 0) {
                    await tx.insert(postToTags).values(
                        tagIds.map((tagId) => ({
                            postId: id,
                            tagId: tagId,
                        }))
                    );
                }
            }

            return updatedPost;
        });

        return NextResponse.json({ success: true, data: result, message: "Post updated successfully" });

    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Manual cascade delete for safety
        await db.transaction(async (tx) => {
            await tx.delete(postToCategories).where(eq(postToCategories.postId, id));
            await tx.delete(postToTags).where(eq(postToTags.postId, id));
            await tx.delete(posts).where(eq(posts.id, id));
        });

        // We assume it succeeded if no error in transaction
        return NextResponse.json({ success: true, message: "Post deleted successfully" });

    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
