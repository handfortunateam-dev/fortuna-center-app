"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { columns } from "@/features/lms/assignments-by-teacher/columns";

export default function AssignmentsByTeacherPage() {
  return (
    <ListGrid
      title="Assignments"
      description="Manage assignments for your classes."
      columns={columns}
      resourcePath="/assignments-by-teacher"
      searchPlaceholder="Search by title..."
      enableEdit={true}
    />
  );
}