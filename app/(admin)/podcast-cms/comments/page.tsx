"use client";

import { ListGrid } from "@/components/table";
import { columnsPodcastComments } from "@/features/podcast-cms/columns";

export default function PodcastCommentsPage() {
  return (
    <ListGrid
      // Header
      title="Podcast Comments"
      description="Moderate comments on your podcast episodes"
      // Resource configuration
      resourcePath="/podcast-cms/comments"
      // Actions
      enableCreate={false}
      enableShow={false}
      enableEdit={false}
      enableDelete={true}
      // Search
      enableSearch={true}
      searchPlaceholder="Search comments..."
      // Table
      columns={columnsPodcastComments}
      pageSize={10}
      showPagination
    />
  );
}
