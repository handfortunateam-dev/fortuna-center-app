"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { StudentForm } from "@/features/lms/students/forms/StudentForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { StudentFormValues } from "@/features/lms/students/interface";
import { createStudent, studentKeys } from "@/services/studentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";

import { Toast } from "@/components/toast";
// ... existing imports

export default function StudentCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form here to control error handling cleanly
  const methods = useForm<StudentFormValues>({
    mode: "onBlur",
  });

  const { setError } = methods;

  const mutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const response = await createStudent(values);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate both all students and the specific lists to ensure immediate refetch
      await queryClient.invalidateQueries({
        queryKey: studentKeys.all,
        refetchType: "all", // Mark as stale and refetch active
      });

      // Also invalidate the key used by ListGrid (resourcePath)
      await queryClient.invalidateQueries({
        queryKey: ["/students"],
        refetchType: "all", // Mark as stale and refetch active
      });

      Toast({
        title: "Success",
        description: "Student created successfully!",
        color: "success",
      });
      router.push("/students");
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
        message: message,
      });
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Create Student"
        description="Fill the details to create a new student."
      >
        <CreateOrEditFormWrapper<StudentFormValues>
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          mode="create"
          methods={methods}
        >
          <StudentForm mode="create" />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
