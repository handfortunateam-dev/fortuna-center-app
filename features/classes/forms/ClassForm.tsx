"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextInput, TextareaInput, SwitchInput } from "@/components/ui/Inputs";
import {
  ClassFormValues,
  ClassItem,
} from "@/features/classes/interfaces";
import {
  classKeys,
  createClass,
  updateClass,
  useClassDetail,
} from "@/services/classesService";

type ClassFormMode = "create" | "edit";

interface ClassFormProps {
  mode: ClassFormMode;
  classId?: string;
}

const defaultValues: ClassFormValues = {
  name: "",
  code: "",
  description: "",
  isActive: true,
  createdBy: "",
};

export function ClassForm({ mode, classId }: ClassFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useClassDetail(
    mode === "edit" ? classId : undefined
  );

  const methods = useForm<ClassFormValues>({
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (mode === "edit" && data?.data) {
      const record = data.data as ClassItem;
      reset({
        name: record.name,
        code: record.code,
        description: record.description ?? "",
        isActive: !!record.isActive,
        createdBy: record.createdBy,
      });
    } else if (mode === "create") {
      reset(defaultValues);
    }
  }, [data, mode, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClassFormValues) => {
      if (mode === "create") {
        const response = await createClass(values);
        return response.data;
      }

      if (!classId) {
        throw new Error("Missing class id for edit mode");
      }

      const response = await updateClass(classId, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all });
      router.push("/classes");
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Unknown error");
    },
  });

  const onSubmit = async (values: ClassFormValues) => {
    setFormError(null);
    await mutation.mutateAsync(values);
  };

  const title = mode === "edit" ? "Edit Class" : "Create Class";
  const primaryLabel = mode === "edit" ? "Save Changes" : "Create Class";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                  ? "Update the class information below."
                  : "Fill the details to create a new class."}
              </p>
            </div>

            {mode === "edit" && isLoading ? (
              <p className="text-sm text-gray-500">Loading class data...</p>
            ) : (
              <FormProvider {...methods}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="Class Code"
                      name="code"
                      placeholder="e.g., MATH101"
                      helperText="Use a unique identifier for this class."
                      validation={{
                        required: "Class code is required",
                      }}
                    />
                    <TextInput
                      label="Class Name"
                      name="name"
                      placeholder="e.g., Mathematics 101"
                      helperText="Friendly name students will see."
                      validation={{
                        required: "Class name is required",
                      }}
                    />
                  </div>

                  <TextareaInput
                    label="Description"
                    name="description"
                    placeholder="Enter class description"
                    minRows={4}
                    required={false}
                    description="Optional summary shown on detail screens."
                  />

                  <TextInput
                    label="Created By (Admin ID)"
                    name="createdBy"
                    placeholder="Creator user ID"
                    validation={{
                      required: "Creator ID is required",
                    }}
                  />

                  <SwitchInput
                    color="primary"
                    description="Mark as active to make this class visible."
                    helperText="Toggle off to archive the class without deleting it."
                    label="Class status"
                    name="isActive"
                  />

                  {formError && (
                    <div className="text-red-600 text-sm">{formError}</div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="flat"
                      onPress={() => router.push("/classes")}
                      isDisabled={isSubmitting || mutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      type="submit"
                      isLoading={mutation.isPending || isSubmitting}
                    >
                      {primaryLabel}
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
