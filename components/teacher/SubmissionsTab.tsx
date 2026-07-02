"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  Card,
  CardBody,
  User,
  Chip,
  Button,
  Textarea,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { Toast } from "@/components/toast";

interface Student {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Submission {
  id: string;
  studentId: string;
  content: string | null;
  attachments: { url: string; type: string; name: string }[] | null;
  status: "pending" | "submitted" | "graded" | "late";
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
}

interface SubmissionWithStudent {
  student: Student;
  submission: Submission | null;
}

interface SubmissionsData {
  assignment: {
    id: string;
    title: string;
    maxScore: number;
  };
  submissions: SubmissionWithStudent[];
}

interface SubmissionsTabProps {
  assignmentId: string;
}

export function SubmissionsTab({ assignmentId }: SubmissionsTabProps) {
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithStudent | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  // Fetch submissions
  const { data, isLoading } = useQuery<SubmissionsData>({
    queryKey: ["assignment-submissions", assignmentId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/teacher/assignments/${assignmentId}/submissions`,
      );
      return data.data;
    },
  });

  // Grade mutation
  const gradeMutation = useMutation({
    mutationFn: async ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string;
      score: number;
      feedback: string;
    }) => {
      const { data } = await apiClient.patch(
        `/teacher/submissions/${submissionId}/grade`,
        {
          score,
          feedback,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignment-submissions", assignmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-grades"] });
      Toast({
        title: "Success",
        description: "Submission graded successfully!",
        color: "success",
      });
      onClose();
      setScore("");
      setFeedback("");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        color: "danger",
      });
    },
  });

  const handleGradeClick = (item: SubmissionWithStudent) => {
    setSelectedSubmission(item);
    setScore(item.submission?.score?.toString() || "");
    setFeedback(item.submission?.feedback || "");
    onOpen();
  };

  const handleSubmitGrade = () => {
    if (!selectedSubmission?.submission) return;

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum)) {
      Toast({
        title: "Error",
        description: "Please enter a valid score",
        color: "danger",
      });
      return;
    }

    gradeMutation.mutate({
      submissionId: selectedSubmission.submission.id,
      score: scoreNum,
      feedback: feedback.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Loading submissions..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load submissions
      </div>
    );
  }

  const stats = {
    total: data.submissions.length,
    submitted: data.submissions.filter(
      (s) => s.submission && s.submission.status !== "pending",
    ).length,
    graded: data.submissions.filter((s) => s.submission?.status === "graded")
      .length,
    pending: data.submissions.filter(
      (s) => !s.submission || s.submission.status === "pending",
    ).length,
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-500">Total Students</p>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-500">Submitted</p>
            <p className="text-3xl font-bold text-primary">{stats.submitted}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-500">Graded</p>
            <p className="text-3xl font-bold text-success">{stats.graded}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-default-500">Pending</p>
            <p className="text-3xl font-bold text-warning">{stats.pending}</p>
          </CardBody>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {data.submissions.map((item) => {
          const { student, submission } = item;
          const hasSubmission = !!submission && submission.status !== "pending";

          return (
            <Card key={student.id} className="border-none shadow-md">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <User
                      name={student.name}
                      description={student.email}
                      avatarProps={{
                        src: student.image || undefined,
                        size: "lg",
                      }}
                    />
                    <div className="flex gap-2">
                      <Chip
                        color={
                          submission?.status === "graded"
                            ? "success"
                            : hasSubmission
                              ? "primary"
                              : "default"
                        }
                        variant="flat"
                        size="sm"
                      >
                        {submission?.status || "Not Submitted"}
                      </Chip>
                      {submission?.score !== null &&
                        submission?.score !== undefined && (
                          <Chip color="success" variant="solid" size="sm">
                            Score: {submission.score}/{data.assignment.maxScore}
                          </Chip>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasSubmission && (
                      <>
                        {submission.submittedAt && (
                          <div className="text-right hidden md:block">
                            <p className="text-xs text-default-500">
                              Submitted
                            </p>
                            <p className="text-sm font-medium text-default-foreground">
                              {format(
                                new Date(submission.submittedAt),
                                "MMM dd, HH:mm",
                              )}
                            </p>
                          </div>
                        )}
                        <Button
                          color={
                            submission.status === "graded"
                              ? "default"
                              : "primary"
                          }
                          variant={
                            submission.status === "graded" ? "flat" : "solid"
                          }
                          onPress={() => handleGradeClick(item)}
                          startContent={
                            <Icon
                              icon={
                                submission.status === "graded"
                                  ? "solar:pen-bold"
                                  : "solar:document-add-bold"
                              }
                            />
                          }
                        >
                          {submission.status === "graded"
                            ? "Edit Grade"
                            : "Grade Now"}
                        </Button>
                      </>
                    )}
                    {!hasSubmission && (
                      <Chip color="default" variant="flat">
                        Waiting for submission
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Show submission preview if exists */}
                {hasSubmission && submission.content && (
                  <div className="mt-4 pt-4 border-t border-default-200">
                    <p className="text-sm text-default-600 line-clamp-2">
                      {submission.content}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Grading Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Grade Submission</h3>
                {selectedSubmission && (
                  <p className="text-sm text-default-500 font-normal">
                    Student: {selectedSubmission.student.name}
                  </p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedSubmission?.submission && (
                  <div className="space-y-6">
                    {/* Submission Content */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon
                          icon="solar:document-text-bold"
                          className="text-primary"
                        />
                        Submission Content
                      </h4>
                      <Card className="bg-default-50 dark:bg-default-100/10">
                        <CardBody>
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedSubmission.submission.content ||
                              "No content provided"}
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Attachments */}
                    {selectedSubmission.submission.attachments &&
                      selectedSubmission.submission.attachments.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon
                              icon="solar:paperclip-bold"
                              className="text-secondary"
                            />
                            Attachments (
                            {selectedSubmission.submission.attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedSubmission.submission.attachments.map(
                              (att, idx) => (
                                <Card
                                  key={idx}
                                  isPressable
                                  as="a"
                                  href={att.url}
                                  target="_blank"
                                >
                                  <CardBody className="flex-row items-center gap-3 p-3">
                                    <Icon
                                      icon="solar:file-bold"
                                      className="text-primary"
                                      width={24}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {att.name}
                                      </p>
                                      <p className="text-xs text-default-500">
                                        {att.type}
                                      </p>
                                    </div>
                                    <Icon
                                      icon="solar:download-bold"
                                      width={20}
                                    />
                                  </CardBody>
                                </Card>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <Divider />

                    {/* Grading Form */}
                    <div className="space-y-4">
                      <Input
                        label="Score"
                        type="number"
                        placeholder="Enter score"
                        value={score}
                        onValueChange={setScore}
                        min={0}
                        max={data.assignment.maxScore}
                        endContent={
                          <span className="text-sm text-default-400">
                            / {data.assignment.maxScore}
                          </span>
                        }
                        description={`Maximum score: ${data.assignment.maxScore}`}
                      />
                      <Textarea
                        label="Feedback (Optional)"
                        placeholder="Provide feedback to the student..."
                        value={feedback}
                        onValueChange={setFeedback}
                        minRows={4}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitGrade}
                  isLoading={gradeMutation.isPending}
                  startContent={<Icon icon="solar:check-circle-bold" />}
                >
                  Submit Grade
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
