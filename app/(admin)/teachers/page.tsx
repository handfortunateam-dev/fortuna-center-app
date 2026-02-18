"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { columns } from "@/features/lms/teachers/columns";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { ACTION_BUTTONS, ADD_BUTTON } from "@/components/button/ActionButtons";

export default function TeachersPage() {
  const router = useRouter();

  return (
    <ListGrid
      title="Teachers"
      description="Manage teacher accounts and information"
      columns={columns}
      resourcePath="/teachers"
      enableSearch
      searchPlaceholder="Search by name or email..."
      enableCreate
      enableEdit
      enableDelete
      enableExport
      enableImport
      actionButtons={{
        add: ADD_BUTTON.CREATE("/teachers/create"),
        custom: [
          {
            key: "viewClasses",
            label: "View Classes",
            icon: (
              <Icon
                icon="solar:book-bookmark-bold-duotone"
                className="w-4 h-4"
              />
            ),
            onClick: (id) => router.push(`/teachers/${id}/classes`),
            isIconOnly: true,
          },
          {
            key: "viewAssignments",
            label: "View Assignments",
            icon: (
              <Icon
                icon="solar:document-text-bold-duotone"
                className="w-4 h-4"
              />
            ),
            onClick: (id) => router.push(`/teachers/${id}/assignments`),
            isIconOnly: true,
          },
        ],
        show: ACTION_BUTTONS.SHOW((id) => router.push(`/teachers/${id}`)),
      }}
    />
  );
}
