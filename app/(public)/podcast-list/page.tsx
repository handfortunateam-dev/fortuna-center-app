import { PodcastListSection } from "@/features/public/podcast-live/PodcastListSection";
import { db } from "@/db";
import {
  podcasts as podcastsTable,
  podcastStatusEnum,
} from "@/db/schema/podcast.schema";
import { eq, desc } from "drizzle-orm";
import { PodcastShowDetail } from "@/features/podcast-cms/interfaces";

export const revalidate = 120;

export default async function PodcastListPage() {
  let podcasts: PodcastShowDetail[] = [];
  let errorMessage: string | null = null;

  try {
    const data = await db.query.podcasts.findMany({
      where: eq(podcastsTable.status, "published"),
      orderBy: [desc(podcastsTable.publishedAt)],
      with: {
        author: true,
      },
    });

    podcasts = data.map((podcast) => ({
      ...podcast,
      createdAt: podcast.createdAt.toISOString(),
      updatedAt: podcast.updatedAt.toISOString(),
      publishedAt: podcast.publishedAt?.toISOString() || null,
      author: {
        id: podcast.author.id,
        name: podcast.author.name || "Unknown",
        image: podcast.author.image || null,
      },
    }));
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    errorMessage = "Gagal memuat podcast.";
  }

  return <PodcastListSection podcasts={podcasts} errorMessage={errorMessage} />;
}
