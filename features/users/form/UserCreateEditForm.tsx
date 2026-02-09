"use client";

import { useFormContext } from "react-hook-form";
import { UserRole } from "@/enums/common";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";

export const UserCreateEditForm = ({
  mode = "create",
}: {
  mode?: "create" | "edit";
}) => {
  const { watch } = useFormContext();
  const password = watch("password");

  const roleOptions = Object.values(UserRole).map((role) => ({
    label: role.replace("_", " "),
    value: role,
  }));

  return (
    <>
      <TextInput
        name="email"
        label="Email Address"
        placeholder="user@example.com"
        type="email"
        required
        validation={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
      />

      <TextInput
        name="firstName"
        label="First Name"
        placeholder="John"
        required
        validation={{
          required: "First name is required",
        }}
      />

      <TextInput
        name="lastName"
        label="Last Name (Optional)"
        placeholder="Doe"
      />

      <TextInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter password"
        required={mode === "create"}
        validation={{
          required: mode === "create" ? "Password is required" : false,
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        }}
      />

      <TextInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm password"
        required={mode === "create"}
        validation={{
          required: mode === "create" ? "Please confirm password" : false,
          validate: (val: string | undefined) => {
            // If in edit mode and password is empty, no confirmation needed
            if (mode === "edit" && !password) return true;

            if (val !== password) {
              return "Passwords do not match";
            }
            return true;
          },
        }}
      />

      <SelectInput
        name="role"
        label="User Role"
        options={roleOptions}
        required
        validation={{
          required: "Role is required",
        }}
      />
    </>
  );
};
