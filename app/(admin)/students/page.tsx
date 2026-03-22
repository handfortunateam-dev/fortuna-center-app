"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { getStudentColumns } from "@/features/lms/students/columns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StudentExportModal } from "./StudentExportModal";
import PromotionModal from "@/features/lms/students/PromotionModal";
import { IStudent } from "@/features/lms/students/interface";
import { getAdditionalOptionsStudent } from "@/features/lms/students/additionalOptionsStudent";
import { getFilterOptionsStudent } from "@/features/lms/students/filterOptionsStudent";
import { Icon } from "@iconify/react";

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
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  const handlePromoteClick = (student: IStudent) => {
    setSelectedStudent(student);
    setIsPromotionModalOpen(true);
  };

  return (
    <>
      <ListGrid
        title="Students"
        columns={getStudentColumns(handlePromoteClick)}
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
        additionalOptions={getAdditionalOptionsStudent({
          router,
          setIsExportModalOpen,
        })}
        filters={getFilterOptionsStudent()}
        actionButtons={{
          custom: [
            {
              key: "promote",
              label: "Promote",
              icon: (
                <Icon
                  icon="solar:round-transfer-vertical-bold"
                  className="w-4 h-4"
                />
              ),
              onClick: (id) => router.push(`/students/${id}/promote`),
              isIconOnly: true,
            },
          ],
        }}
      />

      <StudentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => {
          setIsPromotionModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </>
  );
}
