"use client";

import { use } from "react";
import PodcastEpisodeForm from "@/features/podcast-cms/PodcastEpisodeForm";
import { useCreatePodcastEpisode } from "@/services/podcastService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";

export default function CreatePodcastEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: podcastId } = use(params);
  const router = useRouter();
  const { mutateAsync: createEpisode, isPending } =
    useCreatePodcastEpisode(podcastId);

  const handleSubmit = async (data: any) => {
    try {
      await createEpisode(data);
      Toast({
        title: "Success",
        description: "Podcast episode created successfully",
        color: "success",
      });
      router.push(`/podcast-cms/shows/${podcastId}`);
    } catch (error) {
      console.error("Failed to create episode:", error);
      Toast({
        title: "Error",
        description: "Failed to create podcast episode",
        color: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Episode</h1>
      </div>
      <PodcastEpisodeForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
}
