"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ClassForm } from "@/features/lms/classes/forms/ClassForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { ClassFormValues } from "@/features/lms/classes/interfaces";
import { createClass, classKeys } from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { Toast } from "@/components/toast";

export default function CreateClassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form here to control error handling cleanly
  const methods = useForm<ClassFormValues>({
    mode: "onBlur",
  });

  const { setError } = methods;

  const mutation = useMutation({
    mutationFn: async (values: ClassFormValues) => {
      const response = await createClass(values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all });
      Toast({
        title: "Success",
        description: "Class created successfully",
        color: "success",
      });

      router.push("/classes");
    },
    onError: (error: unknown) => {
      Toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        color: "danger",
      });
    },
  });

  // const onSubmit = async (values: ClassFormValues) => {
  //   await mutation.mutateAsync(values);
  // };

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Create Class"
        description="Fill the details to create a new class."
      >
        {/* Pass methods to wrapper so it doesn't need to recreate useForm */}
        <CreateOrEditFormWrapper<ClassFormValues>
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          mode="create"
          methods={methods}
        >
          <ClassForm mode="create" />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
