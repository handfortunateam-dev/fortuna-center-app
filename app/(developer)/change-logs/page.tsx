"use client";

import { useDeleteChangeLog } from "@/features/change-logs/services/changeLogsService";
import { Changelog } from "@/features/change-logs/interfaces";
import { Toast } from "@/components/toast";
import { ListGrid } from "@/components/table";
import { columnsChangeLogs } from "@/features/change-logs/columns";

export default function ChangeLogPage() {
  const { mutate: deleteLog } = useDeleteChangeLog();

  const handleDelete = (id: string) => {
    deleteLog(id, {
      onSuccess: () =>
        Toast({ title: "Changelog deleted successfully", color: "success" }),
      onError: () =>
        Toast({ title: "Failed to delete changelog", color: "danger" }),
    });
  };

  return (
    <ListGrid<Changelog>
      title="Change Logs"
      description="Track and publish system updates, features, and bug fixes"
      resourcePath="/change-logs"
      basePath="/change-logs"
      serverSide
      enableCreate
      enableEdit
      enableDelete
      enableShow={false}
      enableSearch
      searchPlaceholder="Search change logs by name..."
      paginationType="page"
      pageSize={10}
      rowsPerPageOptions={[10, 50, 100, 200]}
      columns={columnsChangeLogs}
      onDelete={handleDelete}
      deleteConfirmTitle="Delete Changelog"
      deleteConfirmMessage={(item) =>
        `Are you sure you want to delete "${item.title}" (v${item.version})?`
      }
      filters={[
        {
          key: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Feature", value: "FEATURE" },
            { label: "Bug Fix", value: "BUG_FIX" },
            { label: "Improvement", value: "IMPROVEMENT" },
            { label: "Update", value: "UPDATE" },
          ],
        },
      ]}
    />
  );
}
