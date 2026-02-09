"use client";

import { Columns } from "@/components/table";
import { IAssignment } from "./interface";
import { Chip } from "@heroui/react";
import { format } from "date-fns";

export const columns: Columns<IAssignment> = [
  {
    key: "title",
    label: "Title",
  },
  {
    key: "className",
    label: "Class",
  },
  {
    key: "status",
    label: "Status",
    value: (item) => {
      const colorMap: Record<string, "default" | "success" | "warning"> = {
        draft: "default",
        published: "success",
        closed: "warning",
      };
      return (
        <Chip
          color={colorMap[item.status] || "default"}
          size="sm"
          variant="flat"
        >
          {item.status.toUpperCase()}
        </Chip>
      );
    },
  },
  {
    key: "dueDate",
    label: "Due Date",
    value: (item) =>
      item.dueDate ? format(new Date(item.dueDate), "PPP") : "-",
  },
  {
    key: "teacherName",
    label: "Teacher",
  },
];
