"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, use } from "react";
import { useForm } from "react-hook-form";

import { ClassForm } from "@/features/lms/classes/forms/ClassForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { ClassFormValues, ClassItem } from "@/features/lms/classes/interfaces";
import {
  updateClass,
  classKeys,
  useClassDetail,
} from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface ClassEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassEditPage({ params }: ClassEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useClassDetail(resolvedParams.id);

  // Initialize form here
  const methods = useForm<ClassFormValues>({
    mode: "onBlur",
  });

  const { setError, reset } = methods;

  // Reset form with fetched data
  useEffect(() => {
    if (data?.data) {
      const record = data.data as ClassItem;
      reset({
        name: record.name,
        code: record.code,
        description: record.description ?? "",
        isActive: !!record.isActive,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClassFormValues) => {
      const response = await updateClass(resolvedParams.id, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all });
      setTimeout(() => {
        router.push("/classes");
      }, 2000);
    },
    onError: (error: unknown) => {
      setError("root", {
        message: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const onSubmit = async (values: ClassFormValues) => {
    await mutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="edit" />
      </div>
    );
  }

  if (!data?.data) {
    return <StateMessage message="Class Not Found" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Edit Class"
        description="Update the class information below."
      >
        <CreateOrEditFormWrapper<ClassFormValues>
          onSubmit={onSubmit}
          mode="edit"
          methods={methods}
        >
          <ClassForm mode="edit" />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
