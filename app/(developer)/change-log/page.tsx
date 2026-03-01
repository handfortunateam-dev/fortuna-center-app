"use client";

import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Spinner,
  Chip,
} from "@heroui/react";
// import { Filter, Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Icon } from "@iconify/react";
import {
  useChangeLogs,
  useDeleteChangeLog,
} from "@/features/change-logs/services/changeLogsService";
import { Changelog } from "@/features/change-logs/interfaces";
import { ChangeLogModal } from "@/features/change-logs/components/ChangeLogModal";
import { format } from "date-fns";
import { Toast } from "@/components/toast";

export default function ChangeLogPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Changelog | null>(null);

  const { data, isLoading } = useChangeLogs({
    search: search ? search : undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
  });

  const { mutate: deleteLog, isPending: isDeleting } = useDeleteChangeLog();

  const handleEdit = (log: Changelog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this changelog?")) {
      deleteLog(id, {
        onSuccess: () =>
          Toast({ title: "Changelog deleted successfully", color: "success" }),
        onError: () =>
          Toast({ title: "Failed to delete changelog", color: "danger" }),
      });
    }
  };

  const changelogs = data?.data || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Changelog Management</h1>
          <p className="text-gray-500">
            Track and publish system updates, features, and bug fixes
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
          onPress={handleCreateNew}
        >
          New Update
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search logs..."
          startContent={
            <Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />
          }
          className="max-w-sm"
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              startContent={<Icon icon="lucide:filter" className="w-4 h-4" />}
            >
              {typeFilter === "ALL"
                ? "All Types"
                : typeFilter.replace("_", " ")}
            </Button>
          </DropdownTrigger>
          <DropdownMenu onAction={(key) => setTypeFilter(key as string)}>
            <DropdownItem key="ALL">All Types</DropdownItem>
            <DropdownItem key="FEATURE">Feature</DropdownItem>
            <DropdownItem key="BUG_FIX">Bug Fix</DropdownItem>
            <DropdownItem key="IMPROVEMENT">Improvement</DropdownItem>
            <DropdownItem key="UPDATE">Update</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : changelogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No changelogs found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-medium text-gray-600">Version</th>
                <th className="p-4 font-medium text-gray-600">Type</th>
                <th className="p-4 font-medium text-gray-600">Title</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {changelogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="p-4 font-medium">{log.version}</td>
                  <td className="p-4">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        log.type === "FEATURE"
                          ? "secondary"
                          : log.type === "BUG_FIX"
                            ? "danger"
                            : log.type === "IMPROVEMENT"
                              ? "primary"
                              : "warning"
                      }
                    >
                      {log.type.replace("_", " ")}
                    </Chip>
                  </td>
                  <td className="p-4 max-w-xs truncate" title={log.title}>
                    {log.title}
                  </td>
                  <td className="p-4">
                    <Chip
                      size="sm"
                      variant="dot"
                      color={log.isPublished ? "success" : "default"}
                    >
                      {log.isPublished ? "Published" : "Draft"}
                    </Chip>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {format(new Date(log.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                          <Icon
                            icon="lucide:more-vertical"
                            className="w-4 h-4 text-gray-500"
                          />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={
                            <Icon icon="lucide:edit" className="w-4 h-4" />
                          }
                          onPress={() => handleEdit(log)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          }
                          onPress={() => handleDelete(log.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ChangeLogModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        changelog={editingLog}
      />
    </div>
  );
}
