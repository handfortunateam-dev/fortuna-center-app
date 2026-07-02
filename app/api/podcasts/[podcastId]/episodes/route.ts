import { NextRequest, NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { podcastEpisodes } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ podcastId: string }> }
) {
  try {
    const { podcastId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season");

    const filters = [
      eq(podcastEpisodes.podcastId, podcastId),
      eq(podcastEpisodes.status, "published"),
    ];

    if (season) {
      filters.push(eq(podcastEpisodes.seasonNumber, parseInt(season)));
    }

    const data = await db.query.podcastEpisodes.findMany({
      where: and(...filters),
      orderBy: [desc(podcastEpisodes.createdAt)],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching public episodes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}
