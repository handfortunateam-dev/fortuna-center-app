import React from "react";
import PodcastEpisodeCreateForm from "./PodcastEpisodeCreateForm";

interface PageProps {
  params: Promise<{
    podcastId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { podcastId } = await params;

  return <PodcastEpisodeCreateForm podcastId={podcastId} />;
}
