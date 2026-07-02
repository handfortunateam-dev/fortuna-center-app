"use client";

import { use } from "react";
import PodcastEpisodeForm from "@/features/podcast-cms/PodcastEpisodeForm";
import {
  usePodcastEpisodeDetail,
  useUpdatePodcastEpisode,
} from "@/services/podcastService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { Skeleton } from "@heroui/react";

export default function EditPodcastEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: episode, isLoading: isLoadingEpisode } =
    usePodcastEpisodeDetail(id);
  const { mutateAsync: updateEpisode, isPending } = useUpdatePodcastEpisode();

  const handleSubmit = async (data: any) => {
    try {
      await updateEpisode({ ...data, id });
      Toast({
        title: "Success",
        description: "Podcast episode updated successfully",
        color: "success",
      });
      // Redirect to the podcast show page
      if (episode?.podcastId) {
        router.push(`/podcast-cms/shows/${episode.podcastId}`);
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Failed to update episode:", error);
      Toast({
        title: "Error",
        description: "Failed to update podcast episode",
        color: "danger",
      });
    }
  };

  if (isLoadingEpisode) {
    return <Skeleton className="w-full h-96 rounded-xl" />;
  }

  if (!episode) {
    return <div>Episode not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Podcast Episode</h1>
      </div>
      <PodcastEpisodeForm
        initialData={episode}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
