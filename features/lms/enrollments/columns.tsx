"use client";

import { Columns } from "@/components/table";
import { ClassEnrollmentItem } from "./interfaces";
import { formatDateLong } from "@/lib/utils";

export const columnsClassEnrollments: Columns<ClassEnrollmentItem> = [
  {
    key: "studentName",
    label: "Student",
  },
  {
    key: "className",
    label: "Class",
  },
  {
    key: "enrolledAt",
    label: "Enrolled Date",
    value: (item: ClassEnrollmentItem) => formatDateLong(item.enrolledAt),
  },
  {
    key: "enrolledByName",
    label: "Enrolled By",
  },
];
