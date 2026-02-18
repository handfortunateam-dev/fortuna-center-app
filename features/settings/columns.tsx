"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SystemSetting } from "./interfaces";
import { formatDateTime } from "@/lib/utils/date";

export const columns: ColumnDef<SystemSetting>[] = [
  {
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => (
      <span className="font-medium text-primary">{row.getValue("key")}</span>
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const val = row.getValue("value") as string;
      if (!val) return <span className="text-default-400 italic">Empty</span>;
      // Truncate long values
      return (
        <div className="max-w-[300px] truncate text-default-600" title={val}>
          {val}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const val = row.getValue("description") as string;
      if (!val) return <span className="text-default-400">-</span>;
      return (
        <div className="max-w-[300px] truncate text-default-500" title={val}>
          {val}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt");
      // formatDateTime handles null
      return (
        <span className="text-default-400 text-sm">
          {formatDateTime(date as string)}
        </span>
      );
    },
  },
];
