"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { UserRole } from "@/enums/common";
import { useUser } from "@/services/usersService";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/services/usersService";
import { FormProvider, useForm } from "react-hook-form";
import { TextInput } from "@/components/inputs/TextInput";
import { PasswordGeneratorInput } from "@/components/inputs/PasswordGeneratorInput";

interface EditUserProps {
  id: string;
}

interface EditUserFormData {
  firstName: string;
  lastName: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole | string;
  isAdminEmployeeAlso?: boolean;
}

export default function EditUser({ id }: EditUserProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: userData,
    isLoading: isFetching,
    isError: isFetchError,
  } = useUser(id);

  const methods = useForm<EditUserFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      role: "",
      isAdminEmployeeAlso: false,
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    setError: setFormError,
    formState: { isSubmitting },
  } = methods;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const password = watch("password");
  const selectedRole = watch("role");

  useEffect(() => {
    if (userData?.data) {
      setValue("firstName", userData.data.firstName || "");
      setValue("lastName", userData.data.lastName || "");
      if (userData.data.role) setValue("role", userData.data.role);
      setValue(
        "isAdminEmployeeAlso",
        userData.data.isAdminEmployeeAlso || false,
      );
    }
  }, [userData, setValue]);

  const onSubmit = async (data: EditUserFormData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.message || "Failed to update user");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: usersKeys.lists() });

      // Redirect after 1.5 seconds or allow staying
      setTimeout(() => {
        router.push(`/users`);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating the user",
      );
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (isFetchError) {
    return <div className="text-red-500">Error fetching user data.</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-4 py-4">
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-sm text-gray-500">
            Update user profile information
          </p>
        </CardHeader>

        <CardBody className="gap-4">
          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg p-3">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 items-start bg-green-50 border border-green-200 rounded-lg p-3">
              <Icon
                icon="lucide:check-circle-2"
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-green-800">
                <p className="font-semibold">User updated successfully!</p>
                <p>Redirecting...</p>
              </div>
            </div>
          )}

          {!success && (
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
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
                  label="Last Name"
                  placeholder="Doe"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">User Role</label>
                  <select
                    {...methods.register("role")}
                    disabled={loading || isSubmitting}
                    className="px-3 py-2 border border-gray-300 dark:border-default-200 rounded-lg bg-white dark:bg-default-100 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    {Object.values(UserRole).map((roleVal) => (
                      <option key={roleVal} value={roleVal}>
                        {roleVal.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole === UserRole.TEACHER && (
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex flex-col gap-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...methods.register("isAdminEmployeeAlso")}
                        disabled={loading || isSubmitting}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm font-medium">
                        Is this Teacher also an Administrative Employee?
                      </span>
                    </label>
                    <p className="text-xs text-default-500 pl-6">
                      Checking this will grant the teacher access to the
                      Administrative Dashboard and its tools.
                    </p>
                  </div>
                )}

                <div className="border-t border-divider my-2 pt-2">
                  <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Reset Password (Optional)
                  </p>
                  <PasswordGeneratorInput required={false} />

                  <TextInput
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                    required={false}
                    validation={{
                      validate: (val: string | undefined) => {
                        if (password && val !== password) {
                          return "Passwords do not match";
                        }
                        return true;
                      },
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave password fields blank if you do not want to change the
                    password.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="bordered"
                    onPress={() => router.back()}
                    disabled={loading || isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={loading || isSubmitting}
                    isLoading={loading || isSubmitting}
                    className="flex-1"
                    startContent={
                      !loading &&
                      !isSubmitting && (
                        <Icon icon="lucide:save" className="w-4 h-4" />
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
