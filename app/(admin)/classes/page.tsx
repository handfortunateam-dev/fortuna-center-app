"use client";

import { ListGrid } from "@/components/table";
import { columnsClasses } from "@/features/lms/classes/columns";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
// import router from "next.";

export default function ClassesPage() {

  const router = useRouter();
  return (
    <ListGrid
      title="Class Management"
      description="Manage classes and courses"
      // Resource configuration for auto-fetching and CRUD
      resourcePath="/classes"
      // Auto-generated actions (enabled by default when resourcePath is set)
      enableCreate
      enableShow
      enableEdit
      enableDelete
      enableSearch
      enableExport
      actionButtons={{
        custom: [
          {
            key: "view-students",
            label: "View Students",
            icon: <Icon icon={"tabler:users"} />,
            onClick: (id) => router.push(`/classes/${id}/students`),
          },
        ],
      }}
      // customOptions={[]}
      enableImport
      // Search & Table
      searchPlaceholder="Search classes by name or code..."
      columns={columnsClasses}
      pageSize={10}
      showPagination
      serverSide={true}
      paginationType="page"
    />
  );
}
