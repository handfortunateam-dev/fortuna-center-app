"use client";

import React from "react";
import { ListGrid } from "@/components/ui/ListGrid";
import { useTeacherClasses } from "@/services/classesService";
import { TeacherClassItem } from "@/features/classes/interfaces";
import { ACTION_BUTTONS, ADD_BUTTON } from "@/components/button/ActionButtons";

export default function TeacherClassList() {
  const { data, isLoading, isError, error } = useTeacherClasses();

  const queryError = error instanceof Error ? error : undefined;

  const columns = [
    {
      key: "classId",
      label: "Class ID",
      value: (item: TeacherClassItem) => (
        <code className="text-sm">{item.classId}</code>
      ),
    },
    {
      key: "teacherId",
      label: "Teacher ID",
      value: (item: TeacherClassItem) => (
        <code className="text-sm">{item.teacherId}</code>
      ),
    },
    {
      key: "assignedBy",
      label: "Assigned By",
      value: (item: TeacherClassItem) =>
        item.assignedBy ? (
          <code className="text-sm">{item.assignedBy}</code>
        ) : (
          "-"
        ),
    },
    {
      key: "assignedAt",
      label: "Assigned At",
      value: (item: TeacherClassItem) =>
        new Date(item.assignedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <ListGrid
      keyField="id"
      idField="id"
      title="Teacher-Class Assignments"
      description="Review and audit teacher assignments that connect instructors to classes."
      actionButtons={{
        add: ADD_BUTTON.CREATE("/teacher-classes/create"),
        edit: ACTION_BUTTONS.EDIT("/teacher-classes"),
      }}
      nameField="classId"
      searchPlaceholder="Filter assignments by class or teacher id..."
      data={data}
      loading={isLoading}
      isError={isError}
      error={queryError}
      onSearch={() => {}}
      columns={columns as never}
      pageSize={10}
      showPagination
    />
  );
}
