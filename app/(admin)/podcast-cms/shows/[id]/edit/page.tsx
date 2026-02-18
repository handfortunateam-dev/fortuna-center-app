"use client";

import { use } from "react";
import PodcastShowForm from "@/features/podcast-cms/PodcastShowForm";
import {
  usePodcastShowDetail,
  useUpdatePodcastShow,
} from "@/services/podcastService";
import { useUsers } from "@/services/usersService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { Skeleton } from "@heroui/react";

export default function EditPodcastShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: show, isLoading: isLoadingShow } = usePodcastShowDetail(id);
  const { mutateAsync: updateShow, isPending } = useUpdatePodcastShow();

  // Fetch potential authors
  const { data: usersData } = useUsers({ limit: 100 });
  const authors =
    usersData?.data?.map((user) => ({
      id: user.id,
      fullName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.username ||
        "Unknown",
    })) || [];

  const handleSubmit = async (data: any) => {
    try {
      await updateShow({ ...data, id });
      Toast({
        title: "Success",
        description: "Podcast show updated successfully",
        color: "success",
      });
      router.push(`/podcast-cms/shows/${id}`);
    } catch (error) {
      console.error("Failed to update show:", error);
      Toast({
        title: "Error",
        description: "Failed to update podcast show",
        color: "danger",
      });
    }
  };

  if (isLoadingShow) {
    return <Skeleton className="w-full h-96 rounded-xl" />;
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Podcast Show</h1>
      </div>
      <PodcastShowForm
        initialData={show}
        onSubmit={handleSubmit}
        isLoading={isPending}
        authors={authors}
      />
    </div>
  );
}
