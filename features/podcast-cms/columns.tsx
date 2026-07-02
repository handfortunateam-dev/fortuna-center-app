"use client";

import { Chip } from "@heroui/react";
import { Columns } from "@/components/table";
import { Icon } from "@iconify/react";
import type { PodcastShowAdmin, PodcastEpisodeAdmin, PodcastCommentAdmin } from "./interfaces";

export const columnsShows: Columns<PodcastShowAdmin> = [
  {
    key: "title",
    label: "Title",
    value: (item) => (
      <div className="max-w-md">
        <div className="font-semibold line-clamp-1">{item.title}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">/{item.slug}</div>
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    value: (item) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {item.authorName?.[0]?.toUpperCase() || "?"}
        </div>
        <span className="font-medium">{item.authorName || "Unknown"}</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    value: (item) => {
      const colorMap: Record<string, "default" | "success" | "warning"> = {
        published: "success",
        draft: "warning",
        archived: "default",
      };
      return (
        <Chip size="sm" color={colorMap[item.status] || "default"} variant="flat" className="capitalize">
          {item.status}
        </Chip>
      );
    },
  },
  {
    key: "episodeCount",
    label: "Episodes",
    value: (item) => (
      <span className="flex items-center gap-1 text-sm text-gray-600">
        <Icon icon="lucide:podcast" className="text-default-400" />
        {item.episodeCount}
      </span>
    ),
  },
  {
    key: "publishedAt",
    label: "Published",
    value: (item) =>
      item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-",
  },
  {
    key: "actions",
    label: "Actions",
    align: "center",
    hideable: false,
  },
];

export const columnsEpisodes: Columns<PodcastEpisodeAdmin> = [
  {
    key: "title",
    label: "Title",
    value: (item) => (
      <div className="max-w-md">
        <div className="font-semibold line-clamp-1">{item.title}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">/{item.slug}</div>
      </div>
    ),
  },
  {
    key: "season",
    label: "S/E",
    value: (item) => (
      <span className="text-sm text-gray-600">
        {item.seasonNumber != null ? `S${item.seasonNumber}` : "-"}
        {item.episodeNumber != null ? ` E${item.episodeNumber}` : ""}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    value: (item) => {
      const colorMap: Record<string, "default" | "success" | "warning"> = {
        published: "success",
        draft: "warning",
        archived: "default",
      };
      return (
        <Chip size="sm" color={colorMap[item.status] || "default"} variant="flat" className="capitalize">
          {item.status}
        </Chip>
      );
    },
  },
  {
    key: "duration",
    label: "Duration",
    value: (item) => {
      if (!item.duration) return "-";
      const mins = Math.floor(item.duration / 60);
      const secs = Math.floor(item.duration % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
  },
  {
    key: "stats",
    label: "Stats",
    value: (item) => (
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Icon icon="lucide:play" className="text-default-400" />
          {item.playCount}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="solar:heart-bold" className="text-default-400" />
          {item.likeCount}
        </span>
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    value: (item) =>
      new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    key: "actions",
    label: "Actions",
    align: "center",
    hideable: false,
  },
];

export const columnsPodcastComments: Columns<PodcastCommentAdmin> = [
  {
    key: "content",
    label: "Comment",
    value: (item) => (
      <div className="max-w-md">
        <div className="line-clamp-2 text-sm">{item.content}</div>
        {item.isEdited && <span className="text-xs text-gray-400 italic">(edited)</span>}
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    value: (item) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {item.author?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <span className="font-medium">{item.author?.name || "Unknown"}</span>
      </div>
    ),
  },
  {
    key: "episode",
    label: "Episode",
    value: (item) => (
      <div className="max-w-xs">
        <div className="font-medium line-clamp-1">{item.episode?.title}</div>
        <div className="text-xs text-gray-500">ID: ...{item.episode?.id?.slice(-6)}</div>
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Date",
    value: (item) =>
      new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    key: "actions",
    label: "Actions",
    align: "center",
    hideable: false,
  },
];
