"use client";

import { ListGrid } from "@/components/table";
import { columnsComments } from "@/features/blog/cms-columns";

export default function BlogCommentsPage() {
  return (
    <ListGrid
      // Header
      title="Blog Comments"
      description="Moderate blog comments"
      // Resource configuration
      resourcePath="/blog-cms/comments"
      // Actions
      enableCreate={false}
      enableShow={false}
      enableEdit={false} // Maybe allow edit later, but for now just delete
      enableDelete={true}
      // Table
      searchPlaceholder="Search comments..."
      columns={columnsComments}
      pageSize={10}
      showPagination
    />
  );
}
