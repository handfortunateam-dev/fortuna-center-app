"use client";

import PodcastShowForm from "@/features/podcast-cms/PodcastShowForm";
import { useCreatePodcastShow } from "@/services/podcastService";
import { useUsers } from "@/services/usersService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";

export default function CreatePodcastShowPage() {
  const router = useRouter();
  const { mutateAsync: createShow, isPending } = useCreatePodcastShow();

  // Fetch potential authors (users)
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
      await createShow(data);
      Toast({
        title: "Success",
        description: "Podcast show created successfully",
        color: "success",
      });
      router.push("/podcast-cms/shows");
    } catch (error) {
      console.error("Failed to create show:", error);
      Toast({
        title: "Error",
        description: "Failed to create podcast show",
        color: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Podcast Show</h1>
      </div>
      <PodcastShowForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        authors={authors}
      />
    </div>
  );
}
