"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { AutocompleteInput } from "@/components/inputs";
import { TeacherClassFormValues } from "../interfaces";
import { useTeachersLookup, useClassesLookup } from "@/services/lookupService";

interface TeacherClassFormProps {
  mode?: "create" | "edit";
}

export function TeacherClassForm({}: TeacherClassFormProps) {
  const {} = useFormContext<TeacherClassFormValues>();

  // Use lookup hooks
  const { data: teachers = [], isLoading: loadingTeachers } =
    useTeachersLookup();
  const { data: classes = [], isLoading: loadingClasses } = useClassesLookup();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="Teacher"
          name="teacherId"
          placeholder="Select a teacher..."
          options={teachers.map((t) => ({ label: t.text, value: t.value }))}
          isLoading={loadingTeachers}
          required={true}
        />

        <AutocompleteInput
          label="Class"
          name="classId"
          placeholder="Select a class..."
          options={classes.map((c) => ({ label: c.text, value: c.value }))}
          isLoading={loadingClasses}
          required={true}
        />
      </div>
    </div>
  );
}
