"use client";

import { useMemo } from "react";
import { ListGrid } from "@/components/table";
import { PodcastEpisode } from "@/services/azurecast/interfaces";
import { Chip, Link } from "@heroui/react";
import Image from "next/image";
import { ACTION_BUTTONS } from "@/components/button/ActionButtons";
import { deletePodcastEpisode } from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { ShareButton } from "@/components/share-button/ShareButton";

interface PodcastEpisodesClientProps {
  episodes: PodcastEpisode[];
  podcastTitle: string;
  podcastId: string;
}

export default function PodcastEpisodesClient({
  episodes,
  podcastTitle,
  podcastId,
}: PodcastEpisodesClientProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        key: "art",
        label: "Art",
        value: (item: PodcastEpisode) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <Image
              src={item.playlist_media?.art || item.art || "/placeholder.png"}
              alt={item.title}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
        ),
      },
      {
        key: "episode",
        label: "Episode",
        value: (item: PodcastEpisode) => (
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {item.links.public && (
                <Link
                  href={item.links.public}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Public Page
                </Link>
              )}
              {item.links.download && (
                <>
                  <span>•</span>
                  <Link
                    href={item.links.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Download
                  </Link>
                </>
              )}
            </div>
            <div className="mt-1 flex gap-1">
              {item.is_published ? (
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  classNames={{
                    base: "h-5 rounded bg-green-500/20 text-green-600 dark:text-green-400",
                    content: "px-1 text-[10px] font-semibold",
                  }}
                >
                  Published
                </Chip>
              ) : (
                <Chip
                  size="sm"
                  variant="flat"
                  color="warning"
                  classNames={{
                    base: "h-5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                    content: "px-1 text-[10px] font-semibold",
                  }}
                >
                  Draft
                </Chip>
              )}
              {item.has_media && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  classNames={{
                    base: "h-5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400",
                    content: "px-1 text-[10px] font-semibold",
                  }}
                >
                  Media
                </Chip>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "published",
        label: "Published",
        value: (item: PodcastEpisode) => (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {item.publish_at
              ? new Date(item.publish_at * 1000).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </div>
        ),
      },
      {
        key: "share",
        label: "Share",
        align: "center" as const,
        value: (item: PodcastEpisode) =>
          item.links.public ? (
            <ShareButton
              url={item.links.public}
              title={item.title}
              text={`Check out this episode: ${item.title}`}
              size="sm"
              isIconOnly
              variant="light"
            />
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
      },
    ],
    [],
  );

  return (
    <ListGrid
      title={`Episodes: ${podcastTitle}`}
      description={`${episodes.length} Episodes`}
      data={episodes}
      columns={columns as never}
      keyField="id"
      idField="id"
      nameField="title"
      searchPlaceholder="Search episodes..."
      actionButtons={{
        add: {
          label: "ADD EPISODE",
          href: `/azuracast/podcast/${podcastId}/episodes/create`,
        },
        edit: ACTION_BUTTONS.EDIT((id) => {
          const currentPath = window.location.pathname;
          window.location.href = `${currentPath}/${id}/edit`;
        }),
        delete: ACTION_BUTTONS.DELETE(async (id) => {
          try {
            await deletePodcastEpisode(podcastId, id as string);
            Toast({
              title: "Success",
              description: "Episode deleted successfully",
              color: "success",
            });
            router.refresh();
          } catch (error) {
            console.error("Failed to delete episode:", error);
            Toast({
              title: "Error",
              description: "Failed to delete episode",
              color: "danger",
            });
          }
        }),
      }}
    />
  );
}
