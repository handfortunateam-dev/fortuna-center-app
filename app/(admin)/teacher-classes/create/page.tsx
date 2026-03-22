"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast/index";
import { useQueryClient } from "@tanstack/react-query";

import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { TeacherClassForm } from "@/features/lms/teacher-classes/forms/TeacherClassForm";
import { TeacherClassFormValues } from "@/features/lms/classes/interfaces";
import { createTeacherClass } from "@/services/classesService";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default function CreateTeacherClassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<TeacherClassFormValues> = {
    teacherId: "",
    classId: "",
  };

  const handleCreate = async (data: TeacherClassFormValues) => {
    setError(null);
    try {
      const response = await createTeacherClass(data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to assign teacher");
      }

      await queryClient.invalidateQueries({
        queryKey: ["/teacher-classes"],
        refetchType: "all",
      });

      Toast({
        title: "Success",
        description: "Teacher assigned to class successfully",
        color: "success",
      });

      router.push("/teacher-classes");
    } catch (err: unknown) {
      // Handle axios error or standard error
      const message =
        err.response?.data?.message || err.message || "An error occurred";
      setError(message);

      Toast({
        title: "Error",
        description: message,
        color: "danger",
      });

      throw err; // Re-throw for the wrapper to handle loading state
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-6 border-b border-default-200">
          <Heading size="2xl" weight="bold">
            Assign Teacher to Class
          </Heading>
          <Text size="sm" className="mt-1 default-500">
            Create a new teacher assignment record
          </Text>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="flex gap-2 items-start bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-danger-600 shrink-0 mt-0.5"
              />
              <Text size="sm" className="text-danger-800">
                {error}
              </Text>
            </div>
          )}

          <CreateOrEditFormWrapper<TeacherClassFormValues>
            onSubmit={handleCreate}
            defaultValues={defaultValues}
            mode="create"
          >
            <TeacherClassForm mode="create" />
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
