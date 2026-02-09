"use client";

import { Chip } from "@heroui/react";
import { Columns } from "@/components/table";
import { ClassItem } from "./interfaces";

export const columnsClasses: Columns<ClassItem> = [
  {
    key: "code",
    label: "Code",
    value: (item) => (
      <div className="font-mono font-semibold text-primary">{item.code}</div>
    ),
  },
  {
    key: "name",
    label: "Class Name",
    value: (item) => (
      <div>
        <div className="font-semibold">{item.name}</div>
        <div className="text-xs text-gray-500">
          {item.description || "No description"}
        </div>
      </div>
    ),
  },
  {
    key: "isActive",
    label: "Status",
    value: (item) => (
      <Chip
        size="sm"
        color={item.isActive ? "success" : "default"}
        variant="flat"
      >
        {item.isActive ? "Active" : "Inactive"}
      </Chip>
    ),
  },
  {
    key: "createdAt",
    label: "Created At",
    value: (item) =>
      new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    key: "actions",
    label: "Actions",
    align: "center",
    hideable: false,
  },
];
