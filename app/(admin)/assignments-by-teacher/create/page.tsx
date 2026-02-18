"use client";

export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AssignmentForm } from "@/features/lms/assignments-by-teacher/forms/AssignmentForm";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { AssignmentFormValues } from "@/features/lms/assignments-by-teacher/interface";
import {
  createAssignment,
  assignmentKeys,
} from "@/services/assignmentsService";
import { uploadFileToFirebase } from "@/services/storageService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { Toast } from "@/components/toast";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form
  const methods = useForm<AssignmentFormValues>({
    mode: "onBlur",
    defaultValues: {
      status: "draft",
      maxScore: 100,
    },
  });

  const { setError } = methods;

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

      // Ensure maxScore is number if form passes string
      const payload = {
        ...values,
        maxScore: Number(values.maxScore),
        attachments: processedAttachments,
      };

      const response = await createAssignment(payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      Toast({
        title: "Success",
        description: "Assignment created successfully",
        color: "success",
      });
      setTimeout(() => {
        router.push("/assignments-by-teacher");
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

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Create Assignment"
        description="Create a new assignment for your class."
      >
        <CreateOrEditFormWrapper<AssignmentFormValues>
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          mode="create"
          methods={methods}
        >
          <AssignmentForm mode="create" includeTeacherSelection={true} />
        </CreateOrEditFormWrapper>
      </CardWrapper>
    </div>
  );
}
