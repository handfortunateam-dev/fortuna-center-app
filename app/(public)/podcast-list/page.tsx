import { getPodcasts } from "@/services/azurecast/azuracastService";
import type { Podcast } from "@/services/azurecast/interfaces";
import { PodcastListSection } from "@/features/public/podcast-live/PodcastListSection";

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

  return (
    <PodcastListSection podcasts={podcasts} errorMessage={errorMessage} />
  );
}
