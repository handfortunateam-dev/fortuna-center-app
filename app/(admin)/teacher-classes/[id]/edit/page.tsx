"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, use } from "react";
import { useForm } from "react-hook-form";

import { TeacherClassForm } from "@/features/lms/teacher-classes/forms/TeacherClassForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import {
  TeacherClassFormValues,
  TeacherClassItem,
} from "@/features/lms/classes/interfaces";
import {
  updateTeacherClass,
  teacherClassKeys,
  useTeacherClassDetail,
} from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { Toast } from "@/components/toast";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface TeacherClassEditPageProps {
  params: Promise<{ id: string }>;
}

export default function TeacherClassEditPage({
  params,
}: TeacherClassEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useTeacherClassDetail(resolvedParams.id);

  // Initialize form
  const methods = useForm<TeacherClassFormValues>({
    mode: "onBlur",
  });

  const { setError, reset } = methods;

  // Reset form with fetched data
  useEffect(() => {
    if (data?.data) {
      const record = data.data as TeacherClassItem;
      reset({
        teacherId: record.teacherId,
        classId: record.classId,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (values: TeacherClassFormValues) => {
      const response = await updateTeacherClass(resolvedParams.id, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherClassKeys.all });
      Toast({
        title: "Success",
        description: "Teacher assignment updated successfully",
        color: "success",
      });
      router.push("/teacher-classes");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      Toast({
        title: "Error",
        description: message,
        color: "danger",
      });
      setError("root", {
        message,
      });
    },
  });

  const onSubmit = async (values: TeacherClassFormValues) => {
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
    return <StateMessage message="Teacher Assignment Not Found" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <LoadingScreen isLoading={mutation.isPending} />
      <CardWrapper
        title="Edit Teacher Assignment"
        description="Update the teacher assignment below."
      >
        <CreateOrEditFormWrapper<TeacherClassFormValues>
          onSubmit={onSubmit}
          mode="edit"
          methods={methods}
          backPath="/teacher-classes"
        >
          <TeacherClassForm mode="edit" />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
