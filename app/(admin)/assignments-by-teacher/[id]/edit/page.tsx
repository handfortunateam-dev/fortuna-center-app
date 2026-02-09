"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AssignmentForm } from "@/features/lms/assignments-by-teacher/forms/AssignmentForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { AssignmentFormValues } from "@/features/lms/assignments-by-teacher/interface";
import {
  updateAssignment,
  assignmentKeys,
  useAssignmentDetail,
} from "@/services/assignmentsService";
import { uploadFileToFirebase } from "@/services/storageService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { Toast } from "@/components/toast";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
// import { LoadingSpinner } from "@/components/";

interface EditAssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAssignmentPage({
  params,
}: EditAssignmentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: assignmentData, isLoading } = useAssignmentDetail(id);

  // Initialize form
  const methods = useForm<AssignmentFormValues>({
    mode: "onBlur",
  });

  const { reset, setError } = methods;

  // Reset form with data when fetched
  useEffect(() => {
    if (assignmentData?.data) {
      const data = assignmentData.data;
      reset({
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        classId: data.classId,
        teacherId: data.teacherId,
        status: data.status,
        maxScore: data.maxScore,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        // Map attachments to form format
        attachments:
          data.attachments?.map((att) => ({
            url: att.url,
            name: att.name,
            type: att.type,
          })) || [],
      });
    }
  }, [assignmentData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: AssignmentFormValues) => {
      // Process file uploads if any
      let processedAttachments: {
        url: string;
        type: "image" | "video" | "document" | "audio";
        name: string;
      }[] = [];

      if (values.attachments && values.attachments.length > 0) {
        processedAttachments = await Promise.all(
          values.attachments.map(async (att) => {
            if (att.file) {
              // Upload to Firebase
              const downloadUrl = await uploadFileToFirebase(
                att.file,
                "assignments",
              );
              return {
                url: downloadUrl,
                type: att.type,
                name: att.name,
              };
            }
            // Already uploaded or valid URL
            return {
              url: att.url,
              type: att.type,
              name: att.name,
            };
          }),
        );
      }

      // Ensure maxScore is number
      const payload = {
        ...values,
        maxScore: Number(values.maxScore),
        attachments: processedAttachments,
      };

      const response = await updateAssignment(id, payload);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate both all assignments list and specific detail
      await queryClient.invalidateQueries({ queryKey: assignmentKeys.all });

      Toast({
        title: "Success",
        description: "Assignment updated successfully",
        color: "success",
      });
      router.push("/assignments-by-teacher");
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
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingScreen isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Edit Assignment"
        description="Update assignment details."
      >
        <CreateOrEditFormWrapper<AssignmentFormValues>
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          mode="edit"
          methods={methods}
        >
          <AssignmentForm mode="edit" includeTeacherSelection={true} />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
