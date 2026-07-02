"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

import {
  useStudentAssignmentDetail,
  submitAssignment,
  studentPortalKeys,
} from "@/services/studentPortalService";
import { StudentSubmissionFormValues } from "@/features/lms/student-portal/interface";
import { uploadFileToFirebase } from "@/services/storageService";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { Toast } from "@/components/toast";
import { TextareaInput, FirebaseMultiFileUpload } from "@/components/inputs";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Assignment Detail
  const { data: response, isLoading } = useStudentAssignmentDetail(id);
  const assignment = response?.data;

  // Form for submission
  const methods = useForm<StudentSubmissionFormValues>({
    mode: "onBlur",
    defaultValues: {
      content: "",
      attachments: [],
    },
  });

  const { reset } = methods;

  // Pre-fill if submission exists
  useEffect(() => {
    if (assignment?.submission) {
      reset({
        content: assignment.submission.content || "",
        attachments: assignment.submission.attachments || [],
      });
    }
  }, [assignment, reset]);

  // Mutation for submission
  const mutation = useMutation({
    mutationFn: async (values: StudentSubmissionFormValues) => {
      // 1. Process attachments (upload to Firebase if needed)
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
                "submissions",
              );
              return {
                url: downloadUrl,
                type: att.type,
                name: att.name,
              };
            }
            return {
              url: att.url,
              type: att.type,
              name: att.name,
            };
          }),
        );
      }

      // 2. Submit to API
      const payload = {
        content: values.content,
        attachments: processedAttachments,
      };

      const res = await submitAssignment(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentPortalKeys.assignmentDetail(id),
      });
      queryClient.invalidateQueries({
        queryKey: studentPortalKeys.assignments(),
      });
      Toast({
        title: "Submitted",
        description: "Your assignment has been turned in successfully.",
        color: "success",
      });
    },
    onError: (error: any) => {
      Toast({
        title: "Error",
        description: error.message || "Something went wrong",
        color: "danger",
      });
    },
  });

  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon
          icon="solar:file-remove-bold-duotone"
          className="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 className="text-xl font-bold text-gray-700">
          Assignment Not Found
        </h2>
        <Button className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isSubmitted =
    assignment.submission?.status === "submitted" ||
    assignment.submission?.status === "graded";
  const isLate = assignment.submission?.status === "late"; // Logic for late can be enhanced
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isPastDue = dueDate && new Date() > dueDate;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header / Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="light"
            startContent={<Icon icon="solar:arrow-left-linear" />}
            onPress={() => router.back()}
            className="mb-2 -ml-3"
          >
            Back to Assignments
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {assignment.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Icon icon="solar:user-circle-bold" /> {assignment.teacherName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon icon="solar:calendar-date-bold" />{" "}
              {dueDate ? format(dueDate, "PPP p") : "No Due Date"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip
            color={isSubmitted ? "success" : isPastDue ? "danger" : "warning"}
            variant="flat"
          >
            {assignment.submission?.status
              ? assignment.submission.status.toUpperCase()
              : isPastDue
                ? "MISSING"
                : "ASSIGNED"}
          </Chip>
          <Chip color="primary" variant="dot">
            Max Score: {assignment.maxScore}
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Instructions & Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon
                  icon="solar:document-text-bold-duotone"
                  className="text-primary"
                />
                Instructions
              </h3>
            </CardHeader>
            <CardBody className="p-6 prose prose-sm max-w-none text-gray-600">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    assignment.instructions?.replace(/\n/g, "<br/>") ||
                    "No instructions provided.",
                }}
              />

              {/* Teacher Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="solar:paperclip-bold-duotone" />
                    Reference Materials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignment.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mr-3">
                          <Icon
                            icon={
                              att.type === "image"
                                ? "solar:gallery-bold"
                                : att.type === "video"
                                  ? "solar:play-circle-bold"
                                  : "solar:file-text-bold"
                            }
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate text-gray-700 group-hover:text-primary">
                            {att.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {att.type}
                          </p>
                        </div>
                        <Icon
                          icon="solar:external-link-bold"
                          className="ml-auto text-gray-300 group-hover:text-primary"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Submission Form */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-100 sticky top-24">
            <CardHeader className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon
                  icon="solar:upload-square-bold-duotone"
                  className="text-blue-600"
                />
                Your Work
              </h3>
              {assignment.submission?.score !== null &&
                assignment.submission?.score !== undefined && (
                  <Chip color="success" variant="solid" className="font-bold">
                    Score: {assignment.submission.score}/{assignment.maxScore}
                  </Chip>
                )}
            </CardHeader>
            <CardBody className="p-6">
              <CreateOrEditFormWrapper<StudentSubmissionFormValues>
                onSubmit={async (values) => await mutation.mutateAsync(values)}
                methods={methods}
              >
                <div className="space-y-4">
                  {/* Only allow editing if not graded? Or always allow resubmit depending on logic. Assuming allow unless closed. */}
                  {assignment.status === "closed" ? (
                    <div className="text-center py-6 text-gray-500">
                      <Icon
                        icon="solar:lock-keyhole-bold-duotone"
                        className="w-12 h-12 mx-auto mb-2 opacity-50"
                      />
                      <p>Submissions are closed.</p>
                    </div>
                  ) : (
                    <>
                      <TextareaInput
                        name="content"
                        label="Answer / Notes"
                        placeholder="Type your answer here..."
                        minRows={4}
                      />

                      <Divider className="my-2" />

                      <FirebaseMultiFileUpload
                        name="attachments"
                        label="Attachments"
                        helperText="Form supports Image, Video, Audio, Document"
                      />

                      <div className="pt-2">
                        <Button
                          type="submit"
                          color="primary"
                          fullWidth
                          size="lg"
                          isLoading={mutation.isPending}
                          startContent={
                            !mutation.isPending && (
                              <Icon icon="solar:letter-sent-bold-duotone" />
                            )
                          }
                        >
                          {isSubmitted ? "Resubmit Assignment" : "Turn In"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CreateOrEditFormWrapper>
            </CardBody>
          </Card>

          {/* Feedback Card if graded */}
          {assignment.submission?.feedback && (
            <Card className="shadow-sm border border-yellow-100 bg-yellow-50/30">
              <CardHeader className="px-6 py-3 border-b border-yellow-100/50">
                <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <Icon icon="solar:chat-round-line-bold" /> Teacher Feedback
                </h4>
              </CardHeader>
              <CardBody className="p-6 text-gray-700 italic">
                "{assignment.submission.feedback}"
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
