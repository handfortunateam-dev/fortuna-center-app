"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@heroui/react";
import { TextInput, TextareaInput, SelectInput } from "@/components/inputs";
import { ClassFormValues } from "@/features/lms/classes/interfaces";
import { CLASS_LEVEL_OPTIONS } from "../constants";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Class Code dfdf"
          name="code"
          placeholder="e.g., MATH101"
          helperText="Unique identifier."
          validation={{
            required: "Class code is required",
          }}
        />
        <TextInput
          label="Class Name"
          name="name"
          placeholder="e.g., Mathematics 101"
          helperText="Friendly name."
          validation={{
            required: "Class name is required",
          }}
        />
        <SelectInput
          label="Level"
          name="level"
          placeholder="Select academic tier/level"
          options={CLASS_LEVEL_OPTIONS}
          description="Classification for student grouping."
          required={false}
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

      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Heading
              size="lg"
              weight="semibold"
              className=" text-gray-900 dark:text-gray-100"
            >
              Class Status
            </Heading>
            <Text size="sm" className=" text-gray-500 dark:text-gray-400">
              Determine if this class is visible to students and teachers.
            </Text>
          </div>

          <Controller
            name="isActive"
            control={useFormContext().control}
            defaultValue={true}
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                color="success"
                size="lg"
                thumbIcon={({ isSelected, className }) =>
                  isSelected ? (
                    <svg
                      className={className}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={className}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )
                }
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.value ? "Active" : "Inactive"}
                </span>
              </Switch>
            )}
          />
        </div>
      </div>
    </div>
  );
}
