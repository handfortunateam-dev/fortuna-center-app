"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast/index";

import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { EnrollmentForm } from "@/features/lms/enrollments/forms/EnrollmentForm";
import { ClassEnrollmentFormValues } from "@/features/lms/enrollments/interfaces";
import { createClassEnrollment } from "@/services/classesService";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateEnrollmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<ClassEnrollmentFormValues> = {
    studentId: "",
    classId: "",
  };

  const handleCreate = async (data: ClassEnrollmentFormValues) => {
    setError(null);
    try {
      const response = await createClassEnrollment(data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to enrol student");
      }

      Toast({
        title: "Success",
        description: "Student enrolled in class successfully",
        color: "success",
      });

      // Invalidate queries to refresh list
      await queryClient.invalidateQueries({
        queryKey: ["/class-enrollments"],
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push("/class-enrollments");
      }, 1000);
    } catch (err: unknown) {
      console.error("Create failed:", err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);

      Toast({
        title: "Error",
        description: message,
        color: "danger",
      });

      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-6 border-b border-default-200">
          <h1 className="text-2xl font-bold">Enroll Student in Class</h1>
          <p className="text-sm text-default-500 mt-1">
            Create a new student enrollment record
          </p>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="flex gap-2 items-start bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-danger-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-danger-800">{error}</p>
            </div>
          )}

          <CreateOrEditFormWrapper<ClassEnrollmentFormValues>
            onSubmit={handleCreate}
            defaultValues={defaultValues}
            mode="create"
          >
            <EnrollmentForm mode="create" />
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
