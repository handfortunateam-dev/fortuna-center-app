"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  TextInput,
  TextareaInput,
  AutocompleteInput,
} from "@/components/inputs";
import { StudentFormValues } from "@/features/lms/students/interface";
import { useUsers } from "@/services/usersService";

interface StudentFormProps {
  mode?: "create" | "edit";
}

export function StudentForm({ mode }: StudentFormProps) {
  const {
    // watch
  } = useFormContext<StudentFormValues>();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    limit: 100,
    role: "STUDENT",
  });

  const userOptions = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data.map((user) => ({
      label: user.fullName || user.email || "Unknown",
      value: user.id,
    }));
  }, [usersData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="First Name"
          name="firstName"
          placeholder="e.g., John"
          validation={{
            required: "First name is required",
          }}
        />
        <TextInput
          label="Last Name"
          name="lastName"
          placeholder="e.g., Doe"
          validation={{
            required: "Last name is required",
          }}
        />
      </div>

      <TextInput
        label="Email"
        name="email"
        type="email"
        placeholder="e.g., john.doe@example.com"
        validation={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
      />

      <TextInput
        label="Phone"
        name="phone"
        placeholder="e.g., +1234567890"
        required={false}
      />

      <AutocompleteInput
        label="User Account"
        name="userId"
        placeholder="Select user account..."
        options={userOptions}
        isLoading={isLoadingUsers}
        required={false}
        isClearable
      />

      <TextareaInput
        label="Address"
        name="address"
        placeholder="Enter student address"
        minRows={3}
        required={false}
      />
    </div>
  );
}
