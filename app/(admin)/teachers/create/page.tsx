"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast";
import { FormProvider, useForm } from "react-hook-form";

import { TeacherForm } from "@/features/lms/teachers/forms/TeacherForm";
import { TeacherFormValues } from "@/features/lms/teachers/interface";
import { Button } from "@/components/button/Button";

export default function CreateTeacherPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<TeacherFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create teacher");
      }

      Toast({
        title: "Success",
        description: "Teacher created successfully",
        color: "success",
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });

      router.push("/teachers");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      Toast({
        title: "Error",
        description: msg,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-4 border-b border-divider">
          <h1 className="text-2xl font-bold">Create New Teacher</h1>
          <p className="text-sm text-default-500">
            Add a new teacher to the system
          </p>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="flex gap-2 items-start bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6 text-danger">
              <Icon
                icon="solar:danger-circle-bold-duotone"
                className="w-5 h-5 shrink-0 mt-0.5"
              />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <TeacherForm mode="create" />

              <div className="flex justify-end gap-3 pt-4 border-t border-divider">
                <Button
                  variant="flat"
                  color="default"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  Create Teacher
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    </div>
  );
}
