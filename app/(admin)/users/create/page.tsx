"use client";

import { Card, CardBody, CardHeader, Checkbox } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useFormContext, useWatch } from "react-hook-form";
import { UserRole } from "@/enums/common";
import { Toast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";

import { UserCreateEditForm } from "@/features/users/form/UserCreateEditForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";

interface UserFormData {
  email: string;
  firstName: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
}

// Component to conditionally show Quick Registration checkbox
function QuickRegistrationCheckbox({
  isSelected,
  onValueChange,
}: {
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { control } = useFormContext<UserFormData>();
  const selectedRole = useWatch({ control, name: "role" });

  // Only show checkbox if role is STUDENT or TEACHER
  if (selectedRole !== UserRole.STUDENT && selectedRole !== UserRole.TEACHER) {
    return null;
  }

  const label =
    selectedRole === UserRole.STUDENT
      ? "Continue to Quick Student Registration"
      : "Continue to Quick Teacher Setup";

  const description =
    selectedRole === UserRole.STUDENT
      ? "After creating the user account, proceed to complete student identity and class enrollment"
      : "After creating the user account, proceed to complete teacher profile and class assignment";

  return (
    <div className="mt-6 pt-4 border-t border-divider">
      <Checkbox isSelected={isSelected} onValueChange={onValueChange}>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-default-500">{description}</span>
        </div>
      </Checkbox>
    </div>
  );
}

export default function CreateUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [continueToRegistration, setContinueToRegistration] = useState(false);

  // Initial values for the form
  const defaultValues: Partial<UserFormData> = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    // role: '
    // role: UserRole.STUDENT,
  };

  const handleCreateUser = async (formData: UserFormData) => {
    setError(null);
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || "Failed to create user";
        if (data.details && Array.isArray(data.details)) {
          const detailsStr = data.details
            .map(
              (d: { message?: string; code?: string }) =>
                d.message || d.code || JSON.stringify(d),
            )
            .join("; ");
          errorMessage = `${errorMessage}: ${detailsStr}`;
        }
        throw new Error(errorMessage);
      }

      Toast({
        title: "Success",
        description: "User created successfully!",
        color: "success",
      });

      // Invalidate users list
      await queryClient.invalidateQueries({ queryKey: ["users"] });

      // Redirect based on checkbox
      setTimeout(() => {
        if (continueToRegistration && data.data?.id) {
          if (formData.role === UserRole.STUDENT) {
            router.push(`/students/onboard/${data.data.id}`);
            return;
          }
          if (formData.role === UserRole.TEACHER) {
            router.push(`/teachers/onboard/${data.data.id}`);
            return;
          }
        }
        router.push("/users");
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      Toast({
        title: "Error",
        description: msg,
        color: "danger",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-4 py-4">
          <h1 className="text-2xl font-bold">Create New User</h1>
          <p className="text-sm text-gray-500">
            Add a new user account with role assignment
          </p>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <CreateOrEditFormWrapper<UserFormData>
            onSubmit={handleCreateUser}
            defaultValues={defaultValues}
            mode="create"
          >
            <UserCreateEditForm mode="create" />

            {/* Quick Student Registration Checkbox - Only shows when role is STUDENT */}
            <QuickRegistrationCheckbox
              isSelected={continueToRegistration}
              onValueChange={setContinueToRegistration}
            />

            {/* Quick Student Registration Checkbox - Only shows when role is STUDENT */}
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
