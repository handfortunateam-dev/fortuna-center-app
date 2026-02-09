"use client";

import { ListGrid } from "@/components/table";
import { columnsTags } from "@/features/blog/cms-columns";

export default function BlogTagsPage() {
  return (
    <ListGrid
      // Header
      title="Blog Tags"
      description="Manage blog tags"
      // Resource configuration
      resourcePath="/blog-cms/tags"
      // Actions
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      // Table
      searchPlaceholder="Search tags..."
      columns={columnsTags}
      pageSize={10}
      showPagination
    />
  );
}
