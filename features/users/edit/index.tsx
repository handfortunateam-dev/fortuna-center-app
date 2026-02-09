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
// import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { Icon } from "@iconify/react";
import { useUser } from "@/services/usersService";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/services/usersService";

interface EditUserProps {
  id: string;
}

interface EditUserFormData {
  firstName: string;
  lastName: string;
}

export default function EditUser({ id }: EditUserProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: userData,
    isLoading: isFetching,
    isError: isFetchError,
  } = useUser(id);

  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<EditUserFormData>
  >({});

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        firstName: userData.data.firstName || "",
        lastName: userData.data.lastName || "",
      });
    }
  }, [userData]);

  const validateForm = (): boolean => {
    const errors: Partial<EditUserFormData> = {};

    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name as keyof EditUserFormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update user");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: usersKeys.lists() });

      // Redirect after 1.5 seconds or allow staying
      setTimeout(() => {
        router.push(`/users/${id}`);
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
              <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 items-start bg-green-50 border border-green-200 rounded-lg p-3">
              <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold">User updated successfully!</p>
                <p>Redirecting...</p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                isInvalid={!!validationErrors.firstName}
                errorMessage={validationErrors.firstName}
                disabled={loading}
                required
              />

              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />

              {/* Note: Email and Password updates are complex in Clerk and usually handled via specialized flows or admin SDK separately with more checks, so simplified to name here */}
              <div className="text-xs text-gray-500 italic">
                Email and password changes should be handled through the user
                profile or admin dashboard specialized tools.
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="bordered"
                  onPress={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  className="flex-1"
                  startContent={!loading && <Icon icon="lucide:save" className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
