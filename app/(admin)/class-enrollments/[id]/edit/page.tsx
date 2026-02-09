"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Icon } from "@iconify/react";

import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { EnrollmentForm } from "@/features/lms/enrollments/forms/EnrollmentForm";
import { ClassEnrollmentFormValues } from "@/features/lms/enrollments/interfaces";
import {
  useClassEnrollmentDetail,
  updateClassEnrollment,
} from "@/services/classesService";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEnrollmentPage({ params }: EditPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: detailData, isLoading, isError } = useClassEnrollmentDetail(id);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (data: ClassEnrollmentFormValues) => {
    setError(null);
    try {
      const response = await updateClassEnrollment(id, data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update enrollment");
      }

      // Redirect after short delay
      setTimeout(() => {
        router.push("/class-enrollments");
      }, 1000);
    } catch (err: any) {
      console.error("Update failed:", err);
      const message =
        err.response?.data?.message || err.message || "An error occurred";
      setError(message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="edit" />
      </div>
    );
  }

  if (isError || !detailData?.data) {
    return <StateMessage message="Enrollment Not Found" />;
  }

  const enrollment = detailData.data;

  const defaultValues: Partial<ClassEnrollmentFormValues> = {
    studentId: enrollment.studentId,
    classId: enrollment.classId,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-6 border-b border-default-200">
          <h1 className="text-2xl font-bold">Edit Enrollment</h1>
          <p className="text-sm text-default-500 mt-1">
            Update student enrollment details
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
            onSubmit={handleUpdate}
            defaultValues={defaultValues}
            mode="edit"
          >
            <EnrollmentForm mode="edit" />
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
