"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput } from "@/components/ui/Inputs";
import {
  TeacherClassFormValues,
  TeacherClassItem,
} from "@/features/classes/interfaces";
import {
  createTeacherClass,
  teacherClassKeys,
  updateTeacherClass,
  useTeacherClassDetail,
} from "@/services/classesService";

type TeacherClassFormMode = "create" | "edit";

interface TeacherClassFormProps {
  mode: TeacherClassFormMode;
  assignmentId?: string;
}

const defaultValues: TeacherClassFormValues = {
  teacherId: "",
  classId: "",
  assignedBy: "",
};

export function TeacherClassForm({
  mode,
  assignmentId,
}: TeacherClassFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useTeacherClassDetail(
    mode === "edit" ? assignmentId : undefined
  );

  const methods = useForm<TeacherClassFormValues>({
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (mode === "edit" && data?.data) {
      const record = data.data as TeacherClassItem;
      reset({
        teacherId: record.teacherId,
        classId: record.classId,
        assignedBy: record.assignedBy ?? "",
      });
    } else if (mode === "create") {
      reset(defaultValues);
    }
  }, [data, mode, reset]);

  const mutation = useMutation({
    mutationFn: async (values: TeacherClassFormValues) => {
      if (mode === "create") {
        const response = await createTeacherClass(values);
        return response.data;
      }

      if (!assignmentId) {
        throw new Error("Missing assignment id for edit mode");
      }

      const response = await updateTeacherClass(assignmentId, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherClassKeys.all });
      router.push("/teacher-classes");
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Unknown error");
    },
  });

  const onSubmit = async (values: TeacherClassFormValues) => {
    setFormError(null);
    await mutation.mutateAsync(values);
  };

  const title =
    mode === "edit" ? "Edit Teacher Assignment" : "Assign Teacher to Class";

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
                  ? "Update the teacher assignment below."
                  : "Provide identifiers to link a teacher with a class."}
              </p>
            </div>

            {mode === "edit" && isLoading ? (
              <p className="text-sm text-gray-500">
                Loading assignment details...
              </p>
            ) : (
              <FormProvider {...methods}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <TextInput
                    label="Teacher ID"
                    name="teacherId"
                    placeholder="Teacher user ID"
                    validation={{
                      required: "Teacher ID is required",
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
                    label="Assigned By (Admin ID)"
                    name="assignedBy"
                    placeholder="Optional admin ID"
                    required={false}
                    helperText="Optional: track who made this assignment."
                  />

                  {formError && (
                    <div className="text-sm text-red-600">{formError}</div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="flat"
                      onPress={() => router.push("/teacher-classes")}
                      isDisabled={isSubmitting || mutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      isLoading={isSubmitting || mutation.isPending}
                    >
                      {mode === "edit" ? "Save Assignment" : "Assign Teacher"}
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
