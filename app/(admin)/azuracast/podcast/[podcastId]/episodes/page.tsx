import React from "react";
import {
  getPodcast,
  getPodcastEpisodes,
} from "@/services/azurecast/azuracastPrivateService";
import PodcastEpisodesClient from "./PodcastEpisodesClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    podcastId: string;
  }>;
}

import { PodcastEpisode } from "@/services/azurecast/interfaces";

export default async function Page({ params }: PageProps) {
  const { podcastId } = await params;
  let episodes: PodcastEpisode[] = [];
  let podcastTitle = "Podcast";

  try {
    const [podcastData, episodesData] = await Promise.all([
      getPodcast(podcastId),
      getPodcastEpisodes(podcastId),
    ]);

    podcastTitle = podcastData.title;
    // Handle both array response and paginated response structure
    if (Array.isArray(episodesData)) {
      episodes = episodesData;
    } else if (episodesData && Array.isArray(episodesData.rows)) {
      episodes = episodesData.rows;
    }
  } catch (error) {
    console.error("Failed to fetch podcast episodes:", error);
  }

  return (
    <PodcastEpisodesClient
      episodes={episodes}
      podcastTitle={podcastTitle}
      podcastId={podcastId}
    />
  );
}
