"use client";

import { Chip } from "@heroui/react";
import { Columns } from "@/components/table";
import {
  BlogCategory,
  BlogPost,
  BlogPostAdmin,
  BlogTag,
  BlogComment,
} from "./interfaces";
import { Icon } from "@iconify/react";

import { textToSlug } from "@/lib/slug";

// Extend window for debug flag
declare global {
  interface Window {
    __authorLogged?: boolean;
    __categoriesLogged?: boolean;
  }
}

export const columnsCategories: Columns<BlogCategory> = [
  {
    key: "name",
    label: "Name",
    value: (item) => (
      <div>
        <div className="font-semibold">{item.name}</div>
        <div className="text-xs text-gray-500 font-mono">{item.slug}</div>
      </div>
    ),
  },
  {
    key: "description",
    label: "Description",
    value: (item) => (
      <div className="max-w-xs truncate text-gray-500">
        {item.description || "-"}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created At",
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

export const columnsTags: Columns<BlogTag> = [
  {
    key: "name",
    label: "Name",
    value: (item) => (
      <div>
        <div className="font-semibold">{item.name}</div>
        <div className="text-xs text-gray-500 font-mono">{item.slug}</div>
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created At",
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

export const columnsComments: Columns<BlogComment> = [
  {
    key: "content",
    label: "Comment",
    value: (item) => (
      <div className="max-w-md">
        <div className="line-clamp-2 text-sm">{item.content}</div>
        {item.isEdited && (
          <span className="text-xs text-gray-400 italic">(edited)</span>
        )}
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    value: (item) => (
      <User
        name={item.author?.name || "Unknown"}
        description={`id: ${item.author?.id.substring(0, 8)}...`}
        avatarProps={{
          src: item.author?.image || undefined,
          name: item.author?.name?.[0] || "?",
        }}
      />
    ),
  },
  {
    key: "post",
    label: "Post",
    value: (item) => (
      <div className="max-w-xs">
        <div className="font-medium line-clamp-1">{item.post.title}</div>
        <div className="text-xs text-gray-500">
          ID: ...{item.post.id.slice(-6)}
        </div>
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

export const columnsPosts: Columns<BlogPostAdmin> = [
  {
    key: "title",
    label: "Title",
    value: (item) => (
      <div className="max-w-md">
        <div className="font-semibold line-clamp-1">{item.title}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">
          /{textToSlug(item.title)}
        </div>
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    value: (item) => {
      // DEBUG: Log author data
      if (typeof window !== "undefined" && !window.__authorLogged) {
        console.log("🔍 Author Data Sample (Optimized):", {
          authorName: item.authorName,
        });
        window.__authorLogged = true;
      }

      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {item.authorName?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="font-medium">{item.authorName || "Unknown"}</span>
        </div>
      );
    },
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
        <Chip
          size="sm"
          color={colorMap[item.status] || "default"}
          variant="flat"
          className="capitalize"
        >
          {item.status}
        </Chip>
      );
    },
  },
  {
    key: "categories",
    label: "Categories",
    value: (item) => {
      // DEBUG: Log categories data
      if (typeof window !== "undefined" && !window.__categoriesLogged) {
        console.log("🔍 Categories Data Sample (Optimized):", {
          categoryNames: item.categoryNames,
          isArray: Array.isArray(item.categoryNames),
          count: item.categoryNames?.length,
        });
        window.__categoriesLogged = true;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {item.categoryNames?.map((categoryName, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-default-100 rounded-full text-xs font-medium text-default-600"
            >
              {categoryName}
            </span>
          ))}
          {item.categoryNames?.length === 0 && (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      );
    },
  },
  {
    key: "stats",
    label: "Stats",
    value: (item) => (
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Icon icon="solar:eye-bold" className="text-default-400" />
          {item.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="solar:heart-bold" className="text-default-400" />
          {item.likeCount}
        </span>
      </div>
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
