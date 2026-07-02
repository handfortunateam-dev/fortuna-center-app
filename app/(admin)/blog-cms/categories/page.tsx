"use client";

import { ListGrid } from "@/components/table";
import { columnsCategories } from "@/features/blog/cms-columns";

export default function BlogCategoriesPage() {
  return (
    <ListGrid
      // Header
      title="Blog Categories"
      description="Manage blog categories"
      // Resource configuration
      resourcePath="/blog-cms/categories"
      // Actions
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      // Table
      searchPlaceholder="Search categories..."
      columns={columnsCategories}
      pageSize={10}
      showPagination
    />
  );
}
