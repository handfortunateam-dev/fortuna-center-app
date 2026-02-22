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
      rowsPerPageOptions={[10, 50, 100, 200]}
      filters={[
        {
          key: "gender",
          label: "Gender",
          type: "select",
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
        {
          key: "year",
          label: "Joined Year",
          type: "select",
          options: [
            { label: "2026", value: "2026" },
            { label: "2025", value: "2025" },
            { label: "2024", value: "2024" },
            { label: "2023", value: "2023" },
          ],
        },
        {
          key: "education",
          label: "Education",
          type: "select",
          options: [
            { label: "High School", value: "high_school" },
            { label: "Bachelor", value: "bachelor" },
            { label: "Master", value: "master" },
            { label: "PhD", value: "phd" },
          ],
        },
        {
          key: "occupation",
          label: "Occupation",
          type: "select",
          options: [
            { label: "Student", value: "student" },
            { label: "Employee", value: "employee" },
            { label: "Business Owner", value: "business_owner" },
            { label: "Unemployed", value: "unemployed" },
          ],
        },
      ]}
    />
  );
}
