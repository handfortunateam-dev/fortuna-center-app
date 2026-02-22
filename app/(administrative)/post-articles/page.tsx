"use client";

import { ListGrid } from "@/components/table";
import { columnsPosts } from "@/features/blog/cms-columns";

export default function AdministrativePostArticlesPage() {
  return (
    <ListGrid
      // Config fields exactly the same as admin version
      title="Articles"
      description="Manage articles"
      // Resource configuration
      // The API interacts with /blog-cms/posts internally
      resourcePath="/blog-cms/posts"
      // BasePath ensures routing / routing actions (like "Create" or "Edit") stay in the /administrative group
      basePath="/administrative/post-articles"
      // Actions
      enableCreate={true}
      enableShow={false}
      enableEdit={true}
      enableDelete={true}
      // Search
      enableSearch={true}
      searchPlaceholder="Search articles by title or content..."
      // Table
      columns={columnsPosts}
      pageSize={10}
      showPagination
    />
  );
}
