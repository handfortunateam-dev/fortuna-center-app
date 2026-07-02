import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, postLikes } from "@/db/schema";

// POST: Toggle like on a post (anonymous by IP, or by userId if available)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;

    // Get a unique identifier - use fingerprint from body or fallback to IP
    const body = await request.json().catch(() => ({}));
    const visitorId: string =
      body.visitorId ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    // Check if post exists
    const [post] = await db
      .select({ id: posts.id, likeCount: posts.likeCount })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already liked by this visitor
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.visitorId, visitorId)
        )
      )
      .limit(1);

    if (existingLike) {
      // Unlike: remove the like
      await db
        .delete(postLikes)
        .where(eq(postLikes.id, existingLike.id));

      // Decrement like count
      await db
        .update(posts)
        .set({ likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)` })
        .where(eq(posts.id, postId));

      const [updated] = await db
        .select({ likeCount: posts.likeCount })
        .from(posts)
        .where(eq(posts.id, postId));

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: updated.likeCount,
      });
    } else {
      // Like: add the like
      await db.insert(postLikes).values({
        postId,
        visitorId,
      });

      // Increment like count
      await db
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} + 1` })
        .where(eq(posts.id, postId));

      const [updated] = await db
        .select({ likeCount: posts.likeCount })
        .from(posts)
        .where(eq(posts.id, postId));

      return NextResponse.json({
        success: true,
        liked: true,
        likeCount: updated.likeCount,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Check if current visitor has liked the post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;
    const visitorId =
      request.nextUrl.searchParams.get("visitorId") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.visitorId, visitorId)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      liked: !!existingLike,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
