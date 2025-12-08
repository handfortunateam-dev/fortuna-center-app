"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@/components/ui/Inputs";
import {
  ClassEnrollmentFormValues,
  ClassEnrollmentItem,
} from "@/features/classes/interfaces";
import {
  classEnrollmentKeys,
  createClassEnrollment,
  updateClassEnrollment,
  useClassEnrollmentDetail,
} from "@/services/classesService";

type ClassEnrollmentFormMode = "create" | "edit";

interface ClassEnrollmentFormProps {
  mode: ClassEnrollmentFormMode;
  enrollmentId?: string;
}

const defaultValues: ClassEnrollmentFormValues = {
  studentId: "",
  classId: "",
  enrolledBy: "",
};

export function ClassEnrollmentForm({
  mode,
  enrollmentId,
}: ClassEnrollmentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useClassEnrollmentDetail(
    mode === "edit" ? enrollmentId : undefined
  );

  const methods = useForm<ClassEnrollmentFormValues>({
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (mode === "edit" && data?.data) {
      const record = data.data as ClassEnrollmentItem;
      reset({
        studentId: record.studentId,
        classId: record.classId,
        enrolledBy: record.enrolledBy ?? "",
      });
    } else if (mode === "create") {
      reset(defaultValues);
    }
  }, [data, mode, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClassEnrollmentFormValues) => {
      if (mode === "create") {
        const response = await createClassEnrollment(values);
        return response.data;
      }

      if (!enrollmentId) {
        throw new Error("Missing enrollment id for edit mode");
      }

      const response = await updateClassEnrollment(enrollmentId, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: classEnrollmentKeys.all,
      });
      router.push("/class-enrollments");
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Unknown error");
    },
  });

  const onSubmit = async (values: ClassEnrollmentFormValues) => {
    setFormError(null);
    await mutation.mutateAsync(values);
  };

  const title =
    mode === "edit" ? "Edit Class Enrollment" : "Enroll Student to Class";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="light"
          startContent={<Icon icon="lucide:arrow-left" />}
          onPress={() => router.back()}
        >
          Back
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-gray-500">
                {mode === "edit"
                  ? "Update enrollment details below."
                  : "Provide the student and class to enroll."}
              </p>
            </div>

            {mode === "edit" && isLoading ? (
              <p className="text-sm text-gray-500">
                Loading enrollment details...
              </p>
            ) : (
              <FormProvider {...methods}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <TextInput
                    label="Student ID"
                    name="studentId"
                    placeholder="Student user ID"
                    validation={{
                      required: "Student ID is required",
                    }}
                  />
                  <TextInput
                    label="Class ID"
                    name="classId"
                    placeholder="Class ID"
                    validation={{
                      required: "Class ID is required",
                    }}
                  />
                  <TextInput
                    label="Enrolled By (Admin ID)"
                    name="enrolledBy"
                    placeholder="Optional admin ID"
                    required={false}
                    helperText="Optional: record who enrolled the student."
                  />

                  {formError && (
                    <div className="text-sm text-red-600">{formError}</div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="flat"
                      onPress={() => router.push("/class-enrollments")}
                      isDisabled={isSubmitting || mutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isSubmitting || mutation.isPending}
                    >
                      {mode === "edit" ? "Save Enrollment" : "Enroll Student"}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
