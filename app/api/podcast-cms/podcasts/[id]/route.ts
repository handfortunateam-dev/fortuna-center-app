import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { podcasts, podcastEpisodes, podcastComments, podcastLikes } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const podcast = await db.query.podcasts.findFirst({
      where: eq(podcasts.id, id),
      with: {
        author: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ success: false, message: "Podcast not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: podcast });
  } catch (error) {
    console.error("Error fetching podcast:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, slug, description, coverImage, authorId, status, publishedAt } = body;

    const [existing] = await db.select().from(podcasts).where(eq(podcasts.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Podcast not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(podcasts)
      .set({
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(authorId && { authorId }),
        ...(status && { status }),
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt ? new Date(publishedAt) : null }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(podcasts.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated, message: "Podcast updated successfully" });
  } catch (error) {
    console.error("Error updating podcast:", error);
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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Cascade delete: likes → comments → episodes → podcast
    await db.transaction(async (tx) => {
      // Get all episode IDs for this podcast
      const episodes = await tx
        .select({ id: podcastEpisodes.id })
        .from(podcastEpisodes)
        .where(eq(podcastEpisodes.podcastId, id));

      const episodeIds = episodes.map((e) => e.id);

      for (const epId of episodeIds) {
        await tx.delete(podcastLikes).where(eq(podcastLikes.episodeId, epId));
        await tx.delete(podcastComments).where(eq(podcastComments.episodeId, epId));
      }

      await tx.delete(podcastEpisodes).where(eq(podcastEpisodes.podcastId, id));
      await tx.delete(podcasts).where(eq(podcasts.id, id));
    });

    return NextResponse.json({ success: true, message: "Podcast deleted successfully" });
  } catch (error) {
    console.error("Error deleting podcast:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
