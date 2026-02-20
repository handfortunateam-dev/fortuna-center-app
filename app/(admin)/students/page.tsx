"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { columns } from "@/features/lms/students/columns";

export default function StudentsPage() {
  return (
    <ListGrid
      title="Students"
      columns={columns}
      enableSearch
      enableEdit
      resourcePath="/students"
      searchPlaceholder="Search students..."
      enableExport
      enableImport
      serverSide
      paginationType="page"
      pageSize={10}
    />
  );
}
