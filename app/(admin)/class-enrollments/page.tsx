"use client";

import { ListGrid } from "@/components/table";
import { columnsClassEnrollments } from "@/features/lms/enrollments/columns";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { CLASS_LEVEL_OPTIONS } from "@/features/lms/classes/constants";

export default function ClassEnrollmentsPage() {
  const router = useRouter();

  return (
    <ListGrid
      // Field mapping
      keyField="id"
      idField="id"
      nameField="studentName"
      // Header
      title="Student Class Enrollments"
      description="Manage student enrollments in classes"
      // Resource configuration
      resourcePath="/class-enrollments"
      // Auto-generated actions
      enableCreate
      enableShow
      enableEdit
      enableDelete
      enableExport
      enableImport
      enableSearch
      // Search & Table
      searchPlaceholder="Search by student or class..."
      columns={columnsClassEnrollments}
      pageSize={10}
      showPagination
      serverSide={true}
      paginationType="page"
      filters={[
        {
          key: "level",
          label: "Level",
          type: "select" as const,
          options: CLASS_LEVEL_OPTIONS,
        },
      ]}
      additionalOptions={[
        {
          key: "bulk-enrollment",
          label: "Bulk Enrollment",
          icon: <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6" />,
          onPress: () => router.push("/class-enrollments/bulk"),
        },
      ]}
    />
  );
}
