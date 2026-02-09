"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { TextInput, TextareaInput, SwitchInput } from "@/components/inputs";
import { ClassFormValues } from "@/features/lms/classes/interfaces";

interface ClassFormProps {
  mode?: "create" | "edit";
}

export function ClassForm({}: ClassFormProps) {
  // We use useFormContext so the parent (CreateOrEditFormWrapper) controls the form state
  const {
    // We can use watch if we need conditional logic based on values, similar to User form
    // watch
  } = useFormContext<ClassFormValues>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Class Code"
          name="code"
          placeholder="e.g., MATH101"
          helperText="Use a unique identifier for this class."
          validation={{
            required: "Class code is required",
          }}
        />
        <TextInput
          label="Class Name"
          name="name"
          placeholder="e.g., Mathematics 101"
          helperText="Friendly name students will see."
          validation={{
            required: "Class name is required",
          }}
        />
      </div>

      <TextareaInput
        label="Description"
        name="description"
        placeholder="Enter class description"
        minRows={4}
        required={false}
        description="Optional summary shown on detail screens."
      />

      <SwitchInput
        color="primary"
        description="Mark as active to make this class visible."
        helperText="Toggle off to archive the class without deleting it."
        label="Class status"
        name="isActive"
        defaultSelected={true}
      />
    </div>
  );
}
