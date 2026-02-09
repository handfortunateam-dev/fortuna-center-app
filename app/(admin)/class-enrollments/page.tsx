"use client";

import { ListGrid } from "@/components/table";
import { columnsClassEnrollments } from "@/features/lms/enrollments/columns";

export default function ClassEnrollmentsPage() {
  return (
    <ListGrid
      // Field mapping
      keyField="id"
      idField="id"
      nameField="studentName"
      // Header
      title="Class Enrollments"
      description="Manage student enrollments in classes"
      // Resource configuration
      resourcePath="/class-enrollments"
      // Auto-generated actions
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      // Search & Table
      searchPlaceholder="Search by student or class..."
      columns={columnsClassEnrollments}
      pageSize={10}
      showPagination
    />
  );
}
