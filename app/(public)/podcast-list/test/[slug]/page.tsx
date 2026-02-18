import { db } from "@/db";
import { podcasts as podcastsTable } from "@/db/schema/podcast.schema";
import { podcastEpisodes as episodesTable } from "@/db/schema/podcast-episode.schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PodcastDetailSection } from "@/features/public/podcast-live/PodcastDetailSection";
import {
  PodcastShowDetail,
  PodcastEpisodeDetail,
} from "@/features/podcast-cms/interfaces";

interface PodcastDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    query?: string;
    season?: string;
  }>;
}

export default async function PodcastDetailPage({
  params,
  searchParams,
}: PodcastDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const query = resolvedSearchParams?.query || "";
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // Fetch Podcast
  const podcastData = await db.query.podcasts.findFirst({
    where: eq(podcastsTable.slug, slug),
    with: {
      author: true,
    },
  });

  if (!podcastData) {
    notFound();
  }

  // Verify published status? Assuming we only show published.
  if (podcastData.status !== "published") {
    notFound();
  }

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

  // Build where clause for episodes
  const conditions = [
    eq(episodesTable.podcastId, podcast.id),
    eq(episodesTable.status, "published"),
  ];

  if (query) {
    conditions.push(ilike(episodesTable.title, `%${query}%`));
  }

  if (resolvedSearchParams?.season) {
    conditions.push(
      eq(episodesTable.seasonNumber, Number(resolvedSearchParams.season)),
    );
  }

  // Count total episodes for pagination
  // Drizzle doesn't have a simple count with conditions unless we use sql
  // Simpler approach for now: fetch all matching IDs to count?
  // or just fetch all and paginate in memory if list is small.
  // let's use db.query with limit/offset.

  // Actually, to get total count with filters efficiently in Drizzle requires a separate query.
  // I will just fetch all matching episodes for now and paginate in memory to keep it simple
  // and since I need unique seasons for tabs anyway.

  const allEpisodesData = await db.query.podcastEpisodes.findMany({
    where: and(...conditions),
    orderBy: [desc(episodesTable.publishedAt)],
  });

  const totalCount = allEpisodesData.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginatedEpisodesData = allEpisodesData.slice(
    offset,
    offset + pageSize,
  );

  const episodes: PodcastEpisodeDetail[] = paginatedEpisodesData.map((ep) => ({
    ...ep,
    createdAt: ep.createdAt.toISOString(),
    updatedAt: ep.updatedAt.toISOString(),
    publishedAt: ep.publishedAt?.toISOString() || null,
    podcastId: ep.podcastId,
  }));

  // Get unique seasons
  const allSeasons = Array.from(
    new Set(
      allEpisodesData
        .map((ep) => ep.seasonNumber)
        .filter((s) => s !== null && s !== undefined),
    ),
  ) as number[];
  allSeasons.sort((a, b) => b - a); // Descending

  return (
    <PodcastDetailSection
      podcast={podcast}
      episodes={episodes}
      totalPages={totalPages}
      currentPage={page}
      podcastId={podcast.id} // keeping podcastId prop as ID
      podcastSlug={podcast.slug}
      query={query}
      seasons={allSeasons}
      currentSeason={
        resolvedSearchParams?.season ? Number(resolvedSearchParams.season) : undefined
      }
    />
  );
}
