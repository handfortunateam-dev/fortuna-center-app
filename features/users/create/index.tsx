"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
// import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { UserRole } from "@/enums/common";

interface CreateUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    role: UserRole.STUDENT,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<CreateUserFormData>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<CreateUserFormData> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof CreateUserFormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error from API response
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
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: UserRole.STUDENT,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/users");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the user",
      );
      setLoading(false);
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

        <CardBody className="gap-4">
          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg p-3">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 items-start bg-green-50 border border-green-200 rounded-lg p-3">
              <Icon
                icon="lucide:check-circle-2"
                className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
              />
              <div className="text-sm text-green-800">
                <p className="font-semibold">User created successfully!</p>
                <p>Redirecting to user list...</p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
                errorMessage={validationErrors.email}
                disabled={loading}
                required
              />

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
                label="Last Name (Optional)"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!validationErrors.password}
                errorMessage={validationErrors.password}
                disabled={loading}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!validationErrors.confirmPassword}
                errorMessage={validationErrors.confirmPassword}
                disabled={loading}
                required
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">User Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
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
                  onPress={handleSubmit as never}
                  disabled={loading}
                  isLoading={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
