"use client";

import { Columns } from "@/components/table";
// import { TeacherClassItem } from "./interfaces";
import { TeacherClassItem } from "./interfaces";
import { formatDateLong } from "@/lib/utils";

export const columnsTeacherClasses: Columns<TeacherClassItem> = [
  {
    key: "teacherName",
    label: "Teacher",
  },
  {
    key: "className",
    label: "Class",
  },
  {
    key: "assignedAt",
    label: "Assigned Date",
    value: (item: TeacherClassItem) => formatDateLong(item.assignedAt),
  },
  {
    key: "assignedByName",
    label: "Assigned By",
  },
];
