import React from "react";
import { getPodcastEpisode } from "@/services/azurecast/azuracastPrivateService";
import PodcastEpisodeEditForm from "./PodcastEpisodeEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    podcastId: string;
    episodeId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { podcastId, episodeId } = await params;
  let episode = null;

  try {
    episode = await getPodcastEpisode(podcastId, episodeId);
  } catch (error) {
    console.error("Failed to fetch podcast episode:", error);
    return <div>Failed to load episode data.</div>;
  }

  if (!episode) {
    return <div>Episode not found.</div>;
  }

  return <PodcastEpisodeEditForm podcastId={podcastId} episode={episode} />;
}
