import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { podcasts, podcastEpisodes, podcastComments, podcastLikes } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const episode = await db.query.podcastEpisodes.findFirst({
      where: eq(podcastEpisodes.id, id),
      with: {
        podcast: {
          columns: { id: true, title: true, slug: true },
        },
      },
    });

    if (!episode) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: episode });
  } catch (error) {
    console.error("Error fetching episode:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, slug, description, audioUrl, thumbnailUrl, duration, episodeNumber, seasonNumber, status, publishedAt } = body;

    const [existing] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(podcastEpisodes)
      .set({
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(audioUrl && { audioUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(duration !== undefined && { duration }),
        ...(episodeNumber !== undefined && { episodeNumber }),
        ...(seasonNumber !== undefined && { seasonNumber }),
        ...(status && { status }),
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt ? new Date(publishedAt) : null }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(podcastEpisodes.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated, message: "Episode updated successfully" });
  } catch (error) {
    console.error("Error updating episode:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [existing] = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(podcastLikes).where(eq(podcastLikes.episodeId, id));
      await tx.delete(podcastComments).where(eq(podcastComments.episodeId, id));
      await tx.delete(podcastEpisodes).where(eq(podcastEpisodes.id, id));

      // Decrement episode count
      await tx
        .update(podcasts)
        .set({ episodeCount: sql`GREATEST(${podcasts.episodeCount} - 1, 0)`, updatedAt: new Date() })
        .where(eq(podcasts.id, existing.podcastId));
    });

    return NextResponse.json({ success: true, message: "Episode deleted successfully" });
  } catch (error) {
    console.error("Error deleting episode:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
