"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, CardBody, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

import { AssignmentForm } from "@/features/lms/assignments-by-teacher/forms/AssignmentForm";
import { AssignmentFormValues } from "@/features/lms/assignments-by-teacher/interface";
import {
  createAssignment,
  assignmentKeys,
} from "@/services/assignmentsService";
import { uploadFileToFirebase } from "@/services/storageService";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<AssignmentFormValues>({
    mode: "onBlur",
    defaultValues: {
      status: "draft",
      maxScore: 100,
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Heading
            as="h1"
            size="3xl"
            weight="extrabold"
            className="text-default-900"
          >
            Create New Task
          </Heading>
          <Text className="text-default-500">
            Design a new assignment for your students to complete.
          </Text>
        </div>
        <div className="flex gap-3">
          <Button
            variant="flat"
            color="secondary"
            onPress={() => router.back()}
            startContent={<Icon icon="lucide:x" />}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="lg"
            className="px-8 font-bold shadow-lg shadow-primary-200"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            startContent={<Icon icon="lucide:save" />}
          >
            Create Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="h-2 w-full bg-primary-500" />
            <CardBody className="p-8">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <AssignmentForm
                    mode="create"
                    includeTeacherSelection={false}
                  />
                </form>
              </FormProvider>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md rounded-3xl bg-primary-50">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-primary-700">
                <Icon icon="lucide:info" width={24} />
                <h4 className="font-bold text-lg">Teacher Interface</h4>
              </div>
              <Text className="text-primary-600/80 leading-relaxed text-sm">
                You are creating this assignment as a teacher. Your account will
                automatically be assigned as the author. Make sure to specify
                clear instructions to help your students achieve the best
                results.
              </Text>
              <Divider className="bg-primary-200" />
              <ul className="space-y-3">
                {[
                  "Upload reference PDFs or videos",
                  "Set a clear scoring system",
                  "Specify a mandatory due date",
                  "Save as draft to publish later",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-primary-800 text-xs font-semibold"
                  >
                    <Icon
                      icon="lucide:check-circle-2"
                      className="text-primary-500"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md rounded-3xl bg-default-50 overflow-hidden">
            <div className="bg-default-100 p-4 border-b border-default-200 flex items-center justify-between">
              <h4 className="font-bold text-default-800">Quick Preview</h4>
              <Icon icon="lucide:eye" className="text-default-400" />
            </div>
            <CardBody className="p-6">
              <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-default-200 text-center space-y-2">
                <p className="text-xs font-bold text-default-400 uppercase tracking-widest">
                  Live View Available After Save
                </p>
                <p className="text-sm text-default-400 italic">
                  This will appear in the students module once published.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
