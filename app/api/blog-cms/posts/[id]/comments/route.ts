import { NextRequest, NextResponse } from "next/server";
import { eq, desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { postComments } from "@/db/schema/post-comment.schema";
import { posts } from "@/db/schema/posts.schema";
import { users } from "@/db/schema/users.schema";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// GET: Fetch comments for a specific post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;

    // Verify post exists
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // Fetch top-level comments (no parentId)
    const topLevelComments = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        createdAt: postComments.createdAt,
        isEdited: postComments.isEdited,
        parentId: postComments.parentId,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.authorId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));

    // Build threaded structure
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    for (const comment of topLevelComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of topLevelComments) {
      const node = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(node);
      } else {
        rootComments.push(node);
      }
    }

    return NextResponse.json({ success: true, data: rootComments });
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a comment on a post
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to comment." },
        { status: 401 }
      );
    }

    const { id: postId } = await context.params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Comment content is required." },
        { status: 400 }
      );
    }

    // Verify post exists
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // If replying, verify parent comment exists
    if (parentId) {
      const [parent] = await db
        .select({ id: postComments.id })
        .from(postComments)
        .where(eq(postComments.id, parentId))
        .limit(1);

      if (!parent) {
        return NextResponse.json(
          { success: false, message: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const [newComment] = await db
      .insert(postComments)
      .values({
        postId,
        authorId: user.id,
        content: content.trim(),
        parentId: parentId || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...newComment,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        replies: [],
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
