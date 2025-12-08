"use client";

import { Pagination, Button } from "@heroui/react";
import Link from "next/link";

interface PodcastPaginationProps {
  totalPages: number;
  currentPage: number;
  podcastId: string;
  query?: string;
}

export default function PodcastPagination({
  totalPages,
  currentPage,
  podcastId,
  query,
}: PodcastPaginationProps) {
  return (
    <Pagination
      total={totalPages}
      page={currentPage}
      showControls
      classNames={{
        wrapper: "gap-2",
        item: "w-9 h-9 text-sm",
        cursor: "bg-red-700 text-white",
      }}
      renderItem={({ key, value, ...props }) => (
        <Link
          key={key}
          href={`/podcast-list/${podcastId}?page=${props.page}${
            query ? `&query=${query}` : ""
          }`}
        >
          <Button
            {...props}
            value={value?.toString()}
            size="sm"
            variant={props.isActive ? "solid" : "bordered"}
            color={props.isActive ? "danger" : "default"}
            className={`min-w-9 w-9 h-9 ${props.isActive ? "" : "bg-white"}`}
          >
            {props.children}
          </Button>
        </Link>
      )}
    />
  );
}
