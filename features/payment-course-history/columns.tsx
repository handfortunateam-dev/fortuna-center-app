"use client";

import { Chip } from "@heroui/react";
import { format } from "date-fns";
import { type Column } from "@/components/table";
import { CoursePayment } from "./types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const columns: Column<CoursePayment>[] = [
  {
    key: "student",
    label: "Student",
    value: (item) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{item.student?.name}</span>
        <span className="text-xs text-default-500">{item.student?.email}</span>
      </div>
    ),
  },
  {
    key: "class",
    label: "Class",
    value: (item) => item.class?.name || "-",
  },
  {
    key: "period",
    label: "Month/Year",
    value: (item) => `${MONTHS[item.month - 1]} ${item.year}`,
  },
  {
    key: "amount",
    label: "Amount",
    value: (item) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(item.amount),
  },
  {
    key: "status",
    label: "Status",
    value: (item) => (
      <Chip
        color={item.status === "paid" ? "success" : "danger"}
        variant="flat"
        size="sm"
        className="capitalize"
      >
        {item.status}
      </Chip>
    ),
  },
  {
    key: "paidAt",
    label: "Paid Date",
    value: (item) =>
      item.paidAt ? format(new Date(item.paidAt), "dd MMM yyyy") : "-",
  },
  {
    key: "recorder",
    label: "Recorded By",
    value: (item) => item.recorder?.name || "-",
    defaultVisible: false,
  },
];
