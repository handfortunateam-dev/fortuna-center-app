import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { podcastEpisodes, podcastLikes } from "@/db/schema";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: episodeId } = await context.params;

    const body = await request.json().catch(() => ({}));
    const visitorId: string =
      body.visitorId ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    // Check if episode exists
    const [episode] = await db
      .select({ id: podcastEpisodes.id, likeCount: podcastEpisodes.likeCount })
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.id, episodeId))
      .limit(1);

    if (!episode) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(podcastLikes)
      .where(and(eq(podcastLikes.episodeId, episodeId), eq(podcastLikes.visitorId, visitorId)))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db.delete(podcastLikes).where(eq(podcastLikes.id, existingLike.id));
      await db
        .update(podcastEpisodes)
        .set({ likeCount: sql`GREATEST(${podcastEpisodes.likeCount} - 1, 0)` })
        .where(eq(podcastEpisodes.id, episodeId));

      const [updated] = await db
        .select({ likeCount: podcastEpisodes.likeCount })
        .from(podcastEpisodes)
        .where(eq(podcastEpisodes.id, episodeId));

      return NextResponse.json({ success: true, liked: false, likeCount: updated.likeCount });
    } else {
      // Like
      await db.insert(podcastLikes).values({ episodeId, visitorId });
      await db
        .update(podcastEpisodes)
        .set({ likeCount: sql`${podcastEpisodes.likeCount} + 1` })
        .where(eq(podcastEpisodes.id, episodeId));

      const [updated] = await db
        .select({ likeCount: podcastEpisodes.likeCount })
        .from(podcastEpisodes)
        .where(eq(podcastEpisodes.id, episodeId));

      return NextResponse.json({ success: true, liked: true, likeCount: updated.likeCount });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: episodeId } = await context.params;
    const visitorId =
      request.nextUrl.searchParams.get("visitorId") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    const [existingLike] = await db
      .select()
      .from(podcastLikes)
      .where(and(eq(podcastLikes.episodeId, episodeId), eq(podcastLikes.visitorId, visitorId)))
      .limit(1);

    return NextResponse.json({ success: true, liked: !!existingLike });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
