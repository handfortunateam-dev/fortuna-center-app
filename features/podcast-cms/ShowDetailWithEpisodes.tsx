"use client";

import { usePodcastShowDetail } from "@/services/podcastService";
import { ListGrid } from "@/components/table";
import { columnsEpisodes as defaultColumnsEpisodes } from "./columns";
import { Heading } from "@/components/heading";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Skeleton, Chip, Button, Tooltip } from "@heroui/react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";
import { PodcastEpisodeAdmin } from "./interfaces";

interface ShowDetailWithEpisodesProps {
  id: string;
}

export default function ShowDetailWithEpisodes({
  id,
}: ShowDetailWithEpisodesProps) {
  const { data: show, isLoading } = usePodcastShowDetail(id);
  const queryClient = useQueryClient();

  const handleDeleteEpisode = useCallback(
    async (episodeId: string) => {
      await apiClient.delete(`/podcast-cms/episodes/${episodeId}`);
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes", id] });
      queryClient.invalidateQueries({ queryKey: ["podcast-show-detail", id] });
      // Also invalidate ListGrid's internal query
      queryClient.invalidateQueries({ queryKey: [`/podcast-cms/podcasts/${id}/episodes`] });
      Toast({
        title: "Deleted",
        description: "Episode deleted successfully",
        color: "success",
      });
    },
    [id, queryClient],
  );

  const columns = useMemo(() => {
    // Clone columns to avoid mutating the original
    const newColumns = [...defaultColumnsEpisodes];

    // Find the actions column index
    const actionsIndex = newColumns.findIndex((col) => col.key === "actions");

    if (actionsIndex !== -1) {
      // Replace partial actions column with a custom one or just ensure we have one
      // Since ListGrid auto-generates actions based on enableEdit/Delete,
      // we want to disable auto-edit and insert our own Edit button.
      // Actually, ListGrid appends its own actions.
      // If we provide a column with key "actions", ListGrid might use it or append to it.
      // Let's rely on `enableEdit={false}` and adding a custom action column.

      // We will remove the "actions" placeholder from defaultColumns if it exists
      // because ListGrid adds it automatically if enableEdit/Delete is true.
      // But we want custom Edit, standard Delete.

      // The easiest way is to let ListGrid handle Delete, and we add a custom column for "Edit" before it?
      // Or we can just use `actionButtons` prop in ListGrid to customize.
      // But `actionButtons` prop seems to be for header buttons (export/import), or maybe row actions?
      // Looking at ListGrid code, `actionButtons` prop is `ActionButtonConfig`.

      // Let's try adding a custom column for "Edit" and disabling `enableEdit` in ListGrid.
      newColumns.splice(actionsIndex, 1); // Remove the placeholder

      newColumns.push({
        key: "custom_actions",
        label: "Actions",
        align: "center",
        value: (item: PodcastEpisodeAdmin) => (
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Edit Episode">
              <Link href={`/podcast-cms/episodes/${item.id}/edit`}>
                <Button isIconOnly size="sm" variant="light" color="default">
                  <Icon
                    icon="solar:pen-bold"
                    className="w-4 h-4 text-default-500"
                  />
                </Button>
              </Link>
            </Tooltip>
          </div>
        ),
      });
    }

    return newColumns;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass-panel p-6 rounded-2xl border border-default-200">
          <div className="flex gap-6">
            <Skeleton className="w-32 h-32 rounded-xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="w-1/2 h-8 rounded-lg" />
              <Skeleton className="w-full h-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Show Header */}
      <div className="glass-panel p-6 rounded-2xl border border-default-200">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            {show.coverImage ? (
              <Image
                src={show.coverImage}
                alt={show.title}
                width={200}
                height={200}
                className="w-full md:w-48 h-48 object-cover rounded-xl shadow-md"
              />
            ) : (
              <div className="w-full md:w-48 h-48 bg-default-100 rounded-xl flex items-center justify-center text-default-400">
                <Icon icon="lucide:mic" className="w-16 h-16" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Heading className="text-2xl font-bold">{show.title}</Heading>
                <Link
                  href={`/podcast-list/${show.slug}`}
                  target="_blank"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  View Public Page{" "}
                  <Icon icon="lucide:external-link" className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/podcast-cms/shows/${show.id}/edit`}>
                  <Button
                    variant="bordered"
                    startContent={<Icon icon="solar:pen-bold" />}
                  >
                    Edit Show
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-default-500">
              <div className="flex items-center gap-1">
                <Icon icon="lucide:user" />
                {show.author?.name || "Unknown Author"}
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="lucide:calendar" />
                {show.publishedAt
                  ? new Date(show.publishedAt).toLocaleDateString()
                  : "Unpublished"}
              </div>
              <Chip
                size="sm"
                color={
                  show.status === "published"
                    ? "success"
                    : show.status === "draft"
                      ? "warning"
                      : "default"
                }
                variant="flat"
                className="capitalize"
              >
                {show.status}
              </Chip>
            </div>

            <p className="text-sm text-default-600 line-clamp-3 whitespace-pre-line">
              {show.description || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <ListGrid
        title="Episodes"
        description={`Manage episodes for ${show.title}`}
        resourcePath={`/podcast-cms/podcasts/${id}/episodes`}
        basePath={`/podcast-cms/shows/${id}/episodes`}
        columns={columns}
        enableCreate={true}
        enableEdit={false}
        enableDelete={true}
        enableSearch={true}
        enableShow={false}
        searchPlaceholder="Search episodes..."
        onDelete={handleDeleteEpisode}
      />
    </div>
  );
}
