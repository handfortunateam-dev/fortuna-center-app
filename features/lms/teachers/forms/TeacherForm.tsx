"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  TextInput,
  TextareaInput,
  AutocompleteInput,
  DatePickerInput,
} from "@/components/inputs";
import { TeacherFormValues } from "@/features/lms/teachers/interface";
import { useUsers } from "@/services/usersService";
import { EDUCATION_LEVELS } from "@/features/lms/students/constants";

interface TeacherFormProps {
  mode?: "create" | "edit";
}

export function TeacherForm({ mode }: TeacherFormProps) {
  const {
    // watch
  } = useFormContext<TeacherFormValues>();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    limit: 100,
    role: "TEACHER",
  });

  const userOptions = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data.map((user) => ({
      label: user.fullName || user.email || "Unknown",
      value: user.id,
    }));
  }, [usersData]);

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="First Name"
            name="firstName"
            placeholder="e.g., John"
            validation={{
              required: "First name is required",
            }}
          />
          <TextInput
            label="Middle Name"
            name="middleName"
            placeholder="e.g., William"
            required={false}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AutocompleteInput
            label="Gender"
            name="gender"
            placeholder="Select gender"
            options={genderOptions}
            required={false}
            isClearable
          />
          <TextInput
            label="Place of Birth"
            name="placeOfBirth"
            placeholder="e.g., New York"
            required={false}
          />
          <DatePickerInput
            label="Date of Birth"
            name="dateOfBirth"
            required={false}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Phone Number"
            name="phone"
            placeholder="e.g., +1234567890"
            required={false}
          />
        </div>

        <TextareaInput
          label="Address"
          name="address"
          placeholder="Enter full address"
          minRows={3}
          required={false}
        />
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Education
        </h3>
        <AutocompleteInput
          label="Latest Education"
          name="education"
          placeholder="Select education level"
          options={EDUCATION_LEVELS}
          required={false}
          isClearable
        />
      </div>

      {/* User Account */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Account
        </h3>
        <AutocompleteInput
          label="Link to User Account"
          name="userId"
          placeholder="Select user account (optional)"
          options={userOptions}
          isLoading={isLoadingUsers}
          required={false}
          isClearable
        />
      </div>
    </div>
  );
}
