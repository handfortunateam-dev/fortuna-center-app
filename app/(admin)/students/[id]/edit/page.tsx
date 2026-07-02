"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { StudentForm } from "@/features/lms/students/forms/StudentForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { StudentFormValues } from "@/features/lms/students/interface";
import {
  studentKeys,
  updateStudent,
  useStudentDetail,
} from "@/services/studentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

import { Toast } from "@/components/toast";

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data: studentResponse, isLoading, isError } = useStudentDetail(id);

  const methods = useForm<StudentFormValues>({
    mode: "onBlur",
  });

  const { setError, reset } = methods;

  useEffect(() => {
    if (studentResponse?.data) {
      const student = studentResponse.data;
      reset({
        studentId: student.studentId,
        registrationDate: student.registrationDate,
        firstName: student.firstName,
        middleName: student.middleName || "",
        lastName: student.lastName,
        nickname: student.nickname || "",
        gender: student.gender,
        placeOfBirth: student.placeOfBirth || "",
        dateOfBirth: student.dateOfBirth || "",
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        education: student.education || "",
        occupation: student.occupation || "",
        status: student.status,
        userId: student.userId || undefined,
      });
    }
  }, [studentResponse, reset]);

  const mutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      const response = await updateStudent(id, values);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.all });
      Toast({
        title: "Success",
        description: "Student updated successfully!",
        color: "success",
      });
      setTimeout(() => {
        router.push("/students");
      }, 2000);
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="edit" />
      </div>
    );
  }

  if (isError || !studentResponse?.data) {
    return <StateMessage message="Student Not Found" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Edit Student"
        description="Update the student's details."
      >
        <CreateOrEditFormWrapper<StudentFormValues>
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          mode="edit"
          methods={methods}
        >
          <StudentForm mode="edit" />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
