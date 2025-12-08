import React from "react";
import { getPodcast } from "@/services/azurecast/azuracastPrivateService";
import PodcastEditForm from "./PodcastEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    podcastId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { podcastId } = await params;
  let podcast = null;

  try {
    podcast = await getPodcast(podcastId);
  } catch (error) {
    console.error("Failed to fetch podcast:", error);
    return <div>Failed to load podcast data.</div>;
  }

  if (!podcast) {
    return <div>Podcast not found.</div>;
  }

  return <PodcastEditForm podcast={podcast} />;
}
