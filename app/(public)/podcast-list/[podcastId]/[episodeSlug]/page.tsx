import { db } from "@/db";
import { podcasts as podcastsTable } from "@/db/schema/podcast.schema";
import { podcastEpisodes as episodesTable } from "@/db/schema/podcast-episode.schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import EpisodeDetailSection from "@/features/public/podcast-live/EpisodeDetailSection";
import {
  PodcastShowDetail,
  PodcastEpisodeDetail,
} from "@/features/podcast-cms/interfaces";

interface EpisodeDetailPageProps {
  params: Promise<{
    podcastId: string;
    episodeSlug: string;
  }>;
}

export default async function EpisodeDetailPage({
  params,
}: EpisodeDetailPageProps) {
  const { podcastId: slug, episodeSlug } = await params;

  // Fetch Podcast
  const podcastData = await db.query.podcasts.findFirst({
    where: eq(podcastsTable.slug, slug),
    with: {
      author: true,
    },
  });

  if (!podcastData || podcastData.status !== "published") {
    notFound();
  }

  // Fetch Episode
  const episodeData = await db.query.podcastEpisodes.findFirst({
    where: and(
      eq(episodesTable.slug, episodeSlug),
      eq(episodesTable.podcastId, podcastData.id),
      eq(episodesTable.status, "published"),
    ),
  });

  if (!episodeData) {
    notFound();
  }

  // Transform to details interface
  const podcast: PodcastShowDetail = {
    ...podcastData,
    createdAt: podcastData.createdAt.toISOString(),
    updatedAt: podcastData.updatedAt.toISOString(),
    publishedAt: podcastData.publishedAt?.toISOString() || null,
    author: {
      id: podcastData.author.id,
      name: podcastData.author.name || "Unknown",
      image: podcastData.author.image || null,
    },
  };

  const episode: PodcastEpisodeDetail = {
    ...episodeData,
    createdAt: episodeData.createdAt.toISOString(),
    updatedAt: episodeData.updatedAt.toISOString(),
    publishedAt: episodeData.publishedAt?.toISOString() || null,
    podcastId: podcastData.id,
  };

  return <EpisodeDetailSection podcast={podcast} episode={episode} />;
}
