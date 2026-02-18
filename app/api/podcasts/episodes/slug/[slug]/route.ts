import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { podcastEpisodes } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const episode = await db.query.podcastEpisodes.findFirst({
      where: and(eq(podcastEpisodes.slug, slug), eq(podcastEpisodes.status, "published")),
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
    console.error("Error fetching episode by slug:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
