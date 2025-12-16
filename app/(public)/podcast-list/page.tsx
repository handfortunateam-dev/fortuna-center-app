import { getPodcasts } from "@/services/azurecast/azuracastService";
import type { Podcast } from "@/services/azurecast/interfaces";
import { PodcastListSection } from "@/features/public/podcast-live/PodcastListSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast Programs",
  description:
    "Browse our collection of podcasts featuring student stories, English lessons, and more.",
};

export const revalidate = 120;

export default async function PodcastListPage() {
  let podcasts: Podcast[] = [];
  let errorMessage: string | null = null;

  try {
    podcasts = await getPodcasts();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat podcast.";
  }

  return <PodcastListSection podcasts={podcasts} errorMessage={errorMessage} />;
}
