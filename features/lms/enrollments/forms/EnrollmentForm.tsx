"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { AutocompleteInput } from "@/components/inputs";
import { ClassEnrollmentFormValues } from "../interfaces";
import { useStudentsLookup, useClassesLookup } from "@/services/lookupService";

interface EnrollmentFormProps {
  mode?: "create" | "edit";
}

export function EnrollmentForm({}: EnrollmentFormProps) {
  const {} = useFormContext<ClassEnrollmentFormValues>();

  // Use lookup hooks
  const { data: students = [], isLoading: loadingStudents } =
    useStudentsLookup();
  const { data: classes = [], isLoading: loadingClasses } = useClassesLookup();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="Student"
          name="studentId"
          placeholder="Select a student..."
          options={students.map((s) => ({ label: s.text, value: s.value }))}
          isLoading={loadingStudents}
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
