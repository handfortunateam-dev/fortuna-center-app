import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { podcasts, podcastEpisodes, users } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: podcastId } = await context.params;

    const data = await db.query.podcastEpisodes.findMany({
      where: eq(podcastEpisodes.podcastId, podcastId),
      orderBy: [desc(podcastEpisodes.createdAt)],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching podcast episodes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: podcastId } = await context.params;

    // Verify podcast exists
    const [podcast] = await db.select({ id: podcasts.id }).from(podcasts).where(eq(podcasts.id, podcastId)).limit(1);
    if (!podcast) {
      return NextResponse.json({ success: false, message: "Podcast not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug: providedSlug,
      description,
      audioUrl,
      thumbnailUrl,
      duration,
      episodeNumber,
      seasonNumber,
      status = "draft",
      publishedAt,
    } = body;

    if (!title || !audioUrl) {
      return NextResponse.json({ success: false, message: "Title and audioUrl are required" }, { status: 400 });
    }

    let finalSlug = providedSlug || title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    if (!providedSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const result = await db.transaction(async (tx) => {
      const [newEpisode] = await tx
        .insert(podcastEpisodes)
        .values({
          title,
          slug: finalSlug,
          description,
          audioUrl,
          thumbnailUrl,
          duration,
          episodeNumber,
          seasonNumber,
          podcastId,
          status,
          publishedAt: publishedAt ? new Date(publishedAt) : status === "published" ? new Date() : null,
        })
        .returning();

      // Increment episode count
      await tx
        .update(podcasts)
        .set({ episodeCount: sql`${podcasts.episodeCount} + 1`, updatedAt: new Date() })
        .where(eq(podcasts.id, podcastId));

      return newEpisode;
    });

    return NextResponse.json({ success: true, data: result, message: "Episode created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create episode", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
