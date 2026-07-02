"use client";

import { ListGrid } from "@/components/table";
import { columnsShows } from "@/features/podcast-cms/columns";

export default function PodcastShowsPage() {
  return (
    <ListGrid
      // Header
      title="Podcast Shows"
      description="Manage your podcast shows"
      // Resource configuration
      resourcePath="/podcast-cms/podcasts"
      basePath="/podcast-cms/shows"
      // Actions
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      // Search
      enableSearch={true}
      searchPlaceholder="Search shows by title or slug..."
      // Table
      columns={columnsShows}
      pageSize={10}
      showPagination
    />
  );
}
