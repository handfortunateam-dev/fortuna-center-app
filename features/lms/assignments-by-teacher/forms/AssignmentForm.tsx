"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  TextInput,
  TextareaInput,
  AutocompleteInput,
  SelectInput,
  DatePickerInput,
  FirebaseMultiFileUpload,
} from "@/components/inputs";
import { AssignmentFormValues } from "@/features/lms/assignments-by-teacher/interface";
import { useClasses } from "@/services/classesService";
import { useUsers } from "@/services/usersService";

// This would typically fetch only classes assigned to the logged-in teacher
// For simplicity, we fetch all classes, but UI could filter if we had teacher context here.

interface AssignmentFormProps {
  mode?: "create" | "edit";
  includeTeacherSelection?: boolean;
}

export function AssignmentForm({
  mode,
  includeTeacherSelection = false,
}: AssignmentFormProps) {
  const { control } = useFormContext<AssignmentFormValues>();

  const { data: classesData, isLoading: isLoadingClasses } = useClasses({
    isActive: true, // Only show active classes
  });

  const { data: teachersData, isLoading: isLoadingTeachers } = useUsers({
    role: "TEACHER",
  });

  const classOptions = useMemo(() => {
    if (!classesData?.data) return [];
    return classesData.data.map((cls) => ({
      label: `${cls.name} (${cls.code})`,
      value: cls.id,
    }));
  }, [classesData]);

  const teacherOptions = useMemo(() => {
    if (!teachersData?.data) return [];
    return teachersData.data.map((t) => ({
      label: t.fullName,
      value: t.id,
    }));
  }, [teachersData]);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Title"
          name="title"
          placeholder="e.g., Chapter 1 Homework"
          validation={{
            required: "Title is required",
          }}
        />

        <AutocompleteInput
          label="Class"
          name="classId"
          placeholder="Select a class"
          options={classOptions}
          isLoading={isLoadingClasses}
          required={true}
        />
      </div>

      {includeTeacherSelection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Teacher"
            name="teacherId"
            placeholder="Select a teacher"
            options={teacherOptions}
            isLoading={isLoadingTeachers}
            required={true}
          />
        </div>
      )}

      <TextareaInput
        label="Description"
        name="description"
        placeholder="Brief description of the assignment..."
        minRows={2}
      />

      <FirebaseMultiFileUpload
        name="attachments"
        label="Attachments (Images, Videos, Docs, Audio)"
        helperText="Upload reference materials for students."
      />

      <TextareaInput
        label="Instructions"
        name="instructions"
        placeholder="Detailed instructions for students..."
        minRows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Max Score"
          name="maxScore"
          type="number"
          placeholder="100"
          validation={{
            required: "Max score is required",
            valueAsNumber: true,
            min: { value: 0, message: "Score must be positive" },
          }}
        />

        <DatePickerInput label="Due Date" name="dueDate" required={true} />

        <SelectInput
          label="Status"
          name="status"
          options={statusOptions}
          validation={{
            required: "Status is required",
          }}
        />
      </div>
    </div>
  );
}
