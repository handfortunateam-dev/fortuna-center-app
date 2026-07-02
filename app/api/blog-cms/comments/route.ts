import { NextRequest, NextResponse } from "next/server";
import { desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { postComments } from "@/db/schema/post-comment.schema";
import { posts } from "@/db/schema/posts.schema";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        let filters = undefined;
        if (query) {
            filters = or(
                ilike(postComments.content, `%${query}%`),
                ilike(users.name, `%${query}%`),
                ilike(posts.title, `%${query}%`)
            );
        }

        const data = await db
            .select({
                id: postComments.id,
                content: postComments.content,
                createdAt: postComments.createdAt,
                isEdited: postComments.isEdited,
                post: {
                    id: posts.id,
                    title: posts.title,
                },
                author: {
                    id: users.id,
                    name: users.name,
                    image: users.image,
                    email: users.email
                }
            })
            .from(postComments)
            .leftJoin(posts, eq(postComments.postId, posts.id))
            .leftJoin(users, eq(postComments.authorId, users.id))
            .where(filters)
            .orderBy(desc(postComments.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch comments",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
