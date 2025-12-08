"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { ListGrid } from "@/components/ui/ListGrid";
import { Chip } from "@heroui/react";
import {
  ACTION_BUTTONS,
  ADD_BUTTON,
} from "@/components/ui/Button/ActionButtons";
import { useClasses } from "@/services/classesService";
import { ClassItem } from "@/features/classes/interfaces";

export default function ClassList() {
  const router = useRouter();
  const {
    data: dataClasses,
    isLoading,
    isError,
    error,
  } = useClasses();
  const queryError = error instanceof Error ? error : undefined;

  const columns = [
    {
      key: "code",
      label: "Code",
      value: (classItem: ClassItem) => (
        <div className="font-mono font-semibold text-primary">
          {classItem.code}
        </div>
      ),
    },
    {
      key: "name",
      label: "Class Name",
      value: (classItem: ClassItem) => (
        <div>
          <div className="font-semibold">{classItem.name}</div>
          <div className="text-xs text-gray-500">
            {classItem.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      value: (classItem: ClassItem) => (
        <Chip
          size="sm"
          color={classItem.isActive ? "success" : "default"}
          variant="flat"
        >
          {classItem.isActive ? "Active" : "Inactive"}
        </Chip>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      value: (classItem: ClassItem) =>
        new Date(classItem.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center" as const,
    },
  ];

  return (
    <ListGrid
      keyField="id"
      idField="id"
      title="Class Management"
      description="Manage classes and courses"
      actionButtons={{
        add: ADD_BUTTON.CREATE("/classes/create"),
        show: ACTION_BUTTONS.SHOW((id) => router.push(`/classes/${id}/enroll`)),
        edit: ACTION_BUTTONS.EDIT("/classes"),
      }}
      isError={isError}
      error={queryError}
      loading={isLoading}
      nameField="name"
      searchPlaceholder="Search classes by name or code..."
      data={dataClasses}
      onSearch={() => {}}
      columns={columns as never}
      pageSize={10}
      showPagination
    />
  );
}
