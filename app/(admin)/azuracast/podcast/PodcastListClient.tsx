"use client";

import { useMemo } from "react";
import { ListGrid } from "@/components/ui/ListGrid";
import { Podcast } from "@/services/azurecast/interfaces";
import { Chip, Link } from "@heroui/react";
import { ACTION_BUTTONS } from "@/components/ui/Button/ActionButtons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deletePodcast } from "@/services/azurecast/azuracastPrivateService";
import { Toast } from "@/components/ui/Toast";

interface PodcastListClientProps {
  podcasts: Podcast[];
}

export default function PodcastListClient({
  podcasts,
}: PodcastListClientProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        key: "art",
        label: "Art",
        value: (item: Podcast) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <Image
              src={item.art}
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
        key: "podcast",
        label: "Podcast",
        value: (item: Podcast) => (
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Link
                href={item.links.public_feed}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Public Page
              </Link>
              <span>•</span>
              <Link
                href={item.links.public_feed}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                RSS Feed
              </Link>
            </div>
            <div className="mt-1">
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                classNames={{
                  base: "h-5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
                  content: "px-1 text-[10px] font-semibold",
                }}
              >
                {item.source === "playlist" ? "Playlist-Based" : item.source}
              </Chip>
            </div>
          </div>
        ),
      },
      {
        key: "episodes",
        label: "# Episodes",
        value: (item: Podcast) => (
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {item.episodes}
          </div>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
      },
    ],

    []
  );

  return (
    <ListGrid
      title="Podcasts"
      description={`${podcasts.length} Podcasts`}
      data={podcasts}
      columns={columns as never}
      keyField="id"
      idField="id"
      nameField="title"
      searchPlaceholder="Search..."
      actionButtons={{
        add: {
          label: "ADD PODCAST",
          href: "/azuracast/podcast/create",
        },
        edit: ACTION_BUTTONS.EDIT((id) => {
          // Navigate to /azuracast/podcast/[id]/edit
          router.push(`/azuracast/podcast/${id}/edit`);
        }),
        delete: ACTION_BUTTONS.DELETE(async (id) => {
          try {
            await deletePodcast(id);
            Toast({
              title: "Success",
              description: "Podcast deleted successfully",
              color: "success",
            });
            router.refresh();
          } catch (error) {
            console.error("Failed to delete podcast:", error);
            Toast({
              title: "Error",
              description: "Failed to delete podcast",
              color: "danger",
            });
          }
        }),
        custom: [
          {
            key: "episodes",
            label: "EPISODES",
            variant: "flat",
            color: "default",
            onClick: (id) => router.push(`/azuracast/podcast/${id}/episodes`),
          },
        ],
      }}
    />
  );
}
