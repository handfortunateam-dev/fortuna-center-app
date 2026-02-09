"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, CardBody, Divider, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

import { AssignmentForm } from "@/features/lms/assignments-by-teacher/forms/AssignmentForm";
import { AssignmentFormValues } from "@/features/lms/assignments-by-teacher/interface";
import {
  updateAssignment,
  assignmentKeys,
  useAssignmentDetail,
} from "@/services/assignmentsService";
import { uploadFileToFirebase } from "@/services/storageService";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

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

  const methods = useForm<AssignmentFormValues>({
    mode: "onBlur",
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

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
        maxScore: data.maxScore ?? 100,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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
      let processedAttachments: {
        url: string;
        type: "image" | "video" | "document" | "audio";
        name: string;
      }[] = [];

      if (values.attachments && values.attachments.length > 0) {
        processedAttachments = await Promise.all(
          values.attachments.map(async (att) => {
            if (att.file) {
              const downloadUrl = await uploadFileToFirebase(
                att.file,
                "assignments",
              );
              return { url: downloadUrl, type: att.type, name: att.name };
            }
            return { url: att.url, type: att.type, name: att.name };
          }),
        );
      }

      const payload = {
        ...values,
        maxScore: Number(values.maxScore),
        attachments: processedAttachments,
      };

      const response = await updateAssignment(id, payload);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      Toast({
        title: "Success",
        description: "Assignment updated successfully",
        color: "success",
      });
      router.push("/assignments-for-classes");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      Toast({ title: "Error", description: message, color: "danger" });
      setError("root", { message });
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    await mutation.mutateAsync(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center bg-white p-8 rounded-3xl animate-pulse">
          <div className="space-y-3 w-1/3">
            <div className="h-8 bg-default-200 rounded-lg w-full" />
            <div className="h-4 bg-default-100 rounded-lg w-1/2" />
          </div>
          <div className="h-10 bg-default-100 rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-60 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Heading
            as="h1"
            size="3xl"
            weight="extrabold"
            className="text-default-900"
          >
            Edit Assignment
          </Heading>
          <Text className="text-default-500">
            Refining task:{" "}
            <span className="font-bold text-primary-600">
              {assignmentData?.data.title}
            </span>
          </Text>
        </div>
        <div className="flex gap-3">
          <Button
            variant="flat"
            onPress={() => router.back()}
            startContent={<Icon icon="lucide:arrow-left" />}
          >
            Back
          </Button>
          <Button
            color="primary"
            size="lg"
            className="px-8 font-extrabold shadow-lg shadow-primary-200"
            isLoading={isSubmitting}
            onPress={() => handleSubmit(onSubmit)()}
            startContent={<Icon icon="lucide:check-circle" />}
          >
            Update Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="h-2 w-full bg-primary-600" />
            <CardBody className="p-8">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <AssignmentForm mode="edit" includeTeacherSelection={false} />
                </form>
              </FormProvider>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md rounded-3xl bg-secondary-50">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-secondary-700">
                <Icon icon="lucide:shield-check" width={24} />
                <h4 className="font-bold text-lg">Quick Tip</h4>
              </div>
              <Text className="text-secondary-600/80 leading-relaxed text-sm">
                Updating an assignment will notify students if notification
                settings are enabled. Ensure the due date is still relevant for
                all currently enrolled students.
              </Text>
              <Divider className="bg-secondary-200" />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-secondary-500">
                  LAST UPDATED
                </p>
                <p className="text-sm font-bold text-secondary-800">
                  {assignmentData?.data.updatedAt
                    ? format(new Date(assignmentData.data.updatedAt), "PPP p")
                    : "Recently"}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md rounded-3xl bg-default-50">
            <CardBody className="p-6 space-y-4">
              <h4 className="font-bold text-default-800 flex items-center gap-2">
                <Icon icon="lucide:settings-2" />
                Actions
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="flat"
                  color="danger"
                  startContent={<Icon icon="lucide:trash-2" />}
                >
                  Delete Permanently
                </Button>
                <Button
                  variant="flat"
                  color="warning"
                  startContent={<Icon icon="lucide:archive" />}
                >
                  Archive Task
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
