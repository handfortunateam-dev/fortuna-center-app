import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { podcastComments } from "@/db/schema/podcast-comment.schema";
import { podcastEpisodes } from "@/db/schema/podcast-episode.schema";
import { users } from "@/db/schema/users.schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    let filters = undefined;
    if (query) {
      filters = or(
        ilike(podcastComments.content, `%${query}%`),
        ilike(users.name, `%${query}%`),
        ilike(podcastEpisodes.title, `%${query}%`)
      );
    }

    const data = await db
      .select({
        id: podcastComments.id,
        content: podcastComments.content,
        createdAt: podcastComments.createdAt,
        isEdited: podcastComments.isEdited,
        episode: {
          id: podcastEpisodes.id,
          title: podcastEpisodes.title,
        },
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
          email: users.email,
        },
      })
      .from(podcastComments)
      .leftJoin(podcastEpisodes, eq(podcastComments.episodeId, podcastEpisodes.id))
      .leftJoin(users, eq(podcastComments.authorId, users.id))
      .where(filters)
      .orderBy(desc(podcastComments.createdAt));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
