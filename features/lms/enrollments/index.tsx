"use client";

import React from "react";
import { ListGrid } from "@/components/table";
import { useClassEnrollments } from "@/services/classesService";
import { ClassEnrollmentItem } from "@/features/lms/classes/interfaces";
import { ACTION_BUTTONS, ADD_BUTTON } from "@/components/button/ActionButtons";

export default function ClassEnrollmentList() {
  const { data, isLoading, isError, error } = useClassEnrollments();

  const queryError = error instanceof Error ? error : undefined;

  const columns = [
    {
      key: "classId",
      label: "Class ID",
      value: (item: ClassEnrollmentItem) => (
        <code className="text-sm">{item.classId}</code>
      ),
    },
    {
      key: "studentId",
      label: "Student ID",
      value: (item: ClassEnrollmentItem) => (
        <code className="text-sm">{item.studentId}</code>
      ),
    },
    {
      key: "enrolledBy",
      label: "Enrolled By",
      value: (item: ClassEnrollmentItem) =>
        item.enrolledBy ? (
          <code className="text-sm">{item.enrolledBy}</code>
        ) : (
          "-"
        ),
    },
    {
      key: "enrolledAt",
      label: "Enrolled At",
      value: (item: ClassEnrollmentItem) =>
        new Date(item.enrolledAt).toLocaleString("en-US", {
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
      title="Class Enrollments"
      description="Track students enrolled into the available classes."
      actionButtons={{
        add: ADD_BUTTON.CREATE("/class-enrollments/create"),
        edit: ACTION_BUTTONS.EDIT("/class-enrollments"),
      }}
      nameField="studentId"
      searchPlaceholder="Filter enrollments by class or student id..."
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
