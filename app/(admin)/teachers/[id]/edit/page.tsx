"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { useState } from "react";

import { TeacherForm } from "@/features/lms/teachers/forms/TeacherForm";
import { TeacherFormValues } from "@/features/lms/teachers/interface";
import { Button } from "@/components/button/Button";
import { Toast } from "@/components/toast";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface EditTeacherPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<TeacherFormValues>();

  // Fetch existing teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        const result = await res.json();

        if (!res.ok || !result.data) {
          setNotFound(true);
          return;
        }

        const t = result.data;
        methods.reset({
          firstName: t.firstName || "",
          middleName: t.middleName || "",
          lastName: t.lastName || "",
          gender: t.gender || undefined,
          placeOfBirth: t.placeOfBirth || "",
          dateOfBirth: t.dateOfBirth || undefined,
          email: t.email || "",
          phone: t.phone || "",
          address: t.address || "",
          education: t.education || undefined,
          userId: t.userId || undefined,
        });
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, [id, methods]);

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update teacher");
      }

      await queryClient.invalidateQueries({ queryKey: ["/teachers"], refetchType: "all" });

      Toast({
        title: "Success",
        description: "Teacher updated successfully",
        color: "success",
      });

      router.push("/teachers");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      Toast({ title: "Error", description: msg, color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonCard variant="edit" />
      </div>
    );
  }

  if (notFound) {
    return <StateMessage message="Teacher Not Found" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-4 border-b border-divider">
          <h1 className="text-2xl font-bold">Edit Teacher</h1>
          <p className="text-sm text-default-500">Update teacher information</p>
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
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <TeacherForm mode="edit" />

              <div className="flex justify-end gap-3 pt-4 border-t border-divider">
                <Button
                  variant="flat"
                  color="default"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    </div>
  );
}
