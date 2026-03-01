"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { columns } from "@/features/lms/students/columns";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StudentExportModal } from "./StudentExportModal";

async function bulkDeleteStudents(ids: string[]) {
  const res = await fetch("/api/students/bulk-delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Bulk delete failed");
}

export default function StudentsPage() {
  const router = useRouter();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <ListGrid
        title="Students"
        columns={columns}
        enableSearch
        enableEdit
        resourcePath="/students"
        searchPlaceholder="Search students..."
        // enableExport
        enableImport
        serverSide
        paginationType="page"
        pageSize={10}
        rowsPerPageOptions={[10, 50, 100, 200]}
        // ── Bulk delete (activated via right-click → Select on any row) ─────────
        onBulkDelete={bulkDeleteStudents}
        bulkDeleteConfirmTitle="Delete Selected Students"
        bulkDeleteConfirmMessage={(count) =>
          `Permanently delete ${count} selected student(s)? This cannot be undone.`
        }
        additionalOptions={[
          {
            key: "analytics_students",
            label: "Analytics",
            icon: <Icon icon="lucide:chart-bar" className="w-6 h-6" />,
            onPress: () => {
              router.push("/analytics/users");
            },
          },
          {
            key: "bulk_update",
            label: "Bulk Update",
            icon: <Icon icon="lucide:edit" className="w-6 h-6" />,
            onPress: () => {
              router.push("/students/bulk-update");
            },
          },
          {
            key: "custom_export",
            label: "Export Data",
            icon: <Icon icon="lucide:download" className="w-6 h-6" />,
            onPress: () => {
              setIsExportModalOpen(true);
            },
          },
        ]}
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
              { label: "2022", value: "2022" },
              { label: "2021", value: "2021" },
              { label: "2020", value: "2020" },
              { label: "2019", value: "2019" },
              { label: "2018", value: "2018" },
              { label: "2017", value: "2017" },
              { label: "2016", value: "2016" },
              { label: "2015", value: "2015" },
              { label: "2014", value: "2014" },
              { label: "2013", value: "2013" },
              { label: "2012", value: "2012" },
              { label: "2011", value: "2011" },
              { label: "2010", value: "2010" },
              { label: "2009", value: "2009" },
              { label: "2008", value: "2008" },
              { label: "2007", value: "2007" },
              { label: "2006", value: "2006" },
              { label: "2005", value: "2005" },
              { label: "2004", value: "2004" },
              { label: "2003", value: "2003" },
              { label: "2002", value: "2002" },
              { label: "2001", value: "2001" },
              { label: "2000", value: "2000" },
              { label: "1999", value: "1999" },
              { label: "1998", value: "1998" },
              { label: "1997", value: "1997" },
              { label: "1996", value: "1996" },
              { label: "1995", value: "1995" },
              { label: "1994", value: "1994" },
              { label: "1993", value: "1993" },
              { label: "1992", value: "1992" },
              { label: "1991", value: "1991" },
              { label: "1990", value: "1990" },
              { label: "1989", value: "1989" },
              { label: "1988", value: "1988" },
              { label: "1987", value: "1987" },
              { label: "1986", value: "1986" },
              { label: "1985", value: "1985" },
              { label: "1984", value: "1984" },
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

      <StudentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
}
