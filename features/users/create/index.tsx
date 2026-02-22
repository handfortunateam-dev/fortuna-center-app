"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
} from "@heroui/react";
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
  isAdminEmployeeAlso: boolean;
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
    isAdminEmployeeAlso: false,
  });

  const [quickRegistration, setQuickRegistration] = useState(true);
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
    const newRole = e.target.value as UserRole;
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      // Reset the flag if the new role is not TEACHER
      isAdminEmployeeAlso:
        newRole === UserRole.TEACHER ? prev.isAdminEmployeeAlso : false,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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
          isAdminEmployeeAlso: formData.isAdminEmployeeAlso,
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
        isAdminEmployeeAlso: false,
      });

      // Redirect based on role and quickRegistration
      setTimeout(() => {
        if (quickRegistration && data.user?.id) {
          if (formData.role === UserRole.STUDENT) {
            router.push(`/students/onboard/${data.user.id}`);
            return;
          } else if (formData.role === UserRole.TEACHER) {
            router.push(`/teachers/onboard/${data.user.id}`);
            return;
          }
        }
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

  // Debug: Log role changes and constant values
  React.useEffect(() => {
    console.log("Current Role:", formData.role);
    console.log("Is Student?", formData.role === UserRole.STUDENT);
    console.log("Is Teacher?", formData.role === UserRole.TEACHER);
    console.log("UserRole Enum:", UserRole);
  }, [formData.role]);

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
                <p>
                  {quickRegistration &&
                  (formData.role === UserRole.STUDENT ||
                    formData.role === UserRole.TEACHER)
                    ? `Redirecting to ${formData.role.toLowerCase()} quick setup...`
                    : "Redirecting to user list..."}
                </p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="lastName"
                  label="Last Name (Optional)"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div className="hidden md:block"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

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

              {formData.role === UserRole.TEACHER && (
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg mt-2 flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAdminEmployeeAlso"
                      checked={formData.isAdminEmployeeAlso}
                      onChange={handleCheckboxChange}
                      disabled={loading}
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

              {/* Quick Registration Checkbox */}
              {["STUDENT", "TEACHER"].includes(formData.role) && (
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg mt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      isSelected={quickRegistration}
                      onValueChange={setQuickRegistration}
                      classNames={{
                        label: "text-sm font-medium",
                      }}
                    >
                      Continue to Quick Registration
                    </Checkbox>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Immediately set up profile details and class assignment
                    after creating the account.
                  </p>
                </div>
              )}

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
