import {
  getPodcast,
  getPodcastEpisodes,
} from "@/services/azurecast/azuracastService";
import type {
  Podcast,
  PodcastEpisode,
  PodcastEpisodesResponse,
} from "@/services/azurecast/interfaces";
import { notFound } from "next/navigation";
import { PodcastDetailSection } from "@/features/public/podcast-live/PodcastDetailSection";
import { Metadata } from "next";

interface PodcastDetailPageProps {
  params: Promise<{
    podcastId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}

export async function generateMetadata({
  params,
}: PodcastDetailPageProps): Promise<Metadata> {
  const { podcastId } = await params;

  try {
    const podcast = await getPodcast(podcastId);
    return {
      title: podcast.title,
      description: podcast.description_short || podcast.description,
      openGraph: {
        title: podcast.title,
        description: podcast.description_short || podcast.description,
        images: podcast.art ? [podcast.art] : [],
      },
    };
  } catch (error) {
    return {
      title: "Podcast Detail",
    };
  }
}

export default async function PodcastDetailPage({
  params,
  searchParams,
}: PodcastDetailPageProps) {
  const { podcastId } = await params;
  const { page, query } = await searchParams;

  const parsedPage = Number(page);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let podcast: Podcast | null = null;
  let episodesResponse: PodcastEpisodesResponse | null = null;

  try {
    [podcast, episodesResponse] = await Promise.all([
      getPodcast(podcastId),
      getPodcastEpisodes(podcastId, currentPage, 10, query),
    ]);
  } catch (error) {
    console.error("Failed to fetch podcast details:", error);
    notFound();
  }

  if (!podcast || !episodesResponse) {
    notFound();
  }

  const episodes: PodcastEpisode[] = episodesResponse.rows || [];
  const totalPages = episodesResponse.total_pages || 1;

  return (
    <PodcastDetailSection
      podcast={podcast}
      episodes={episodes}
      totalPages={totalPages}
      currentPage={currentPage}
      podcastId={podcastId}
      query={query}
    />
  );
}
