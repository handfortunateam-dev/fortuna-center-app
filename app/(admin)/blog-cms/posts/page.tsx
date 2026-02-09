"use client";

import { ListGrid } from "@/components/table";
import { columnsPosts } from "@/features/blog/cms-columns";

export default function BlogPostsPage() {
 
 
  return (
    <ListGrid
      // Field mapping handled by resource config
      // Header
      title="Blog Posts"
      description="Manage blog posts"
      // Resource configuration
      resourcePath="/blog-cms/posts"
      // Actions
      enableCreate={true}
      enableShow={false}
      enableEdit={true}
      enableDelete={true}
      // Search
      enableSearch={true}
      searchPlaceholder="Search posts by title or content..."
      // Table
      columns={columnsPosts}
      pageSize={10}
      showPagination
    />
  );
}
