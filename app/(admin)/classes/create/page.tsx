"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ClassForm } from "@/features/lms/classes/forms/ClassForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { ClassFormValues } from "@/features/lms/classes/interfaces";
import { createClass, classKeys } from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";

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
