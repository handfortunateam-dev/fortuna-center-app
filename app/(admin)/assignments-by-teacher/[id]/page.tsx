"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Chip,
  Image,
  Link,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

import { useAssignmentDetail } from "@/services/assignmentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { IAssignment } from "@/features/lms/assignments-by-teacher/interface";

interface AssignmentDetailProps {
  id: string;
}

function AssignmentDetail({ id }: AssignmentDetailProps) {
  const router = useRouter();
  const { data: response, isLoading, isError } = useAssignmentDetail(id);

  if (isLoading) {
    return <AssignmentDetailSkeleton />;
  }

  if (isError || !response?.data) {
    return (
      <CardWrapper title="Error">
        <div className="text-center py-10 text-danger">
          Failed to load assignment details.
        </div>
      </CardWrapper>
    );
  }

  const assignment: IAssignment = response.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "closed":
        return "danger";
      default:
        return "default";
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return "lucide:image";
      case "video":
        return "lucide:video";
      case "audio":
        return "lucide:music";
      case "document":
        return "lucide:file-text";
      default:
        return "lucide:paperclip";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CardWrapper
        title="Assignment Details"
        description="View and manage assignment information."
        action={
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              onPress={() => router.push(`/assignments-by-teacher/${id}/edit`)}
              startContent={<Icon icon="lucide:edit" />}
            >
              Edit Assignment
            </Button>
            <Button
              color="secondary"
              variant="flat"
              onPress={() => router.push("/assignments-by-teacher")}
              startContent={<Icon icon="lucide:arrow-left" />}
            >
              Back to List
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {assignment.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Chip
                  color={getStatusColor(assignment.status)}
                  variant="flat"
                  size="sm"
                >
                  {assignment.status.toUpperCase()}
                </Chip>
                <span className="text-sm text-gray-500">
                  Created on {format(new Date(assignment.createdAt), "PPP")}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {assignment.description || "No description provided."}
              </p>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-800">
                Instructions
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {assignment.instructions || "No instructions provided."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-50/50">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon icon="lucide:school" className="w-5 h-5" />
                    <span className="font-medium">Class</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assignment.className || "Unknown Class"}
                  </span>
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon icon="lucide:user" className="w-5 h-5" />
                    <span className="font-medium">Teacher</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assignment.teacherName || "Unknown Teacher"}
                  </span>
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon icon="lucide:calendar" className="w-5 h-5" />
                    <span className="font-medium">Due Date</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assignment.dueDate
                      ? format(new Date(assignment.dueDate), "PPP")
                      : "No due date"}
                  </span>
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon icon="lucide:star" className="w-5 h-5" />
                    <span className="font-medium">Max Score</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {assignment.maxScore} Points
                  </span>
                </div>
              </CardBody>
            </Card>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {assignment.attachments.map((att, index) => (
                    <Card
                      key={index}
                      isPressable
                      className="border-none bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-500 shadow-sm">
                            <Icon
                              icon={getAttachmentIcon(att.type)}
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-gray-900 truncate">
                              {att.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {att.type}
                            </p>
                          </div>
                          <Button
                            as={Link}
                            href={att.url}
                            target="_blank"
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                          >
                            <Icon
                              icon="lucide:external-link"
                              className="w-4 h-4"
                            />
                          </Button>
                        </div>
                        {att.type === "audio" && (
                          <div className="mt-2">
                            <audio controls className="w-full h-8">
                              <source src={att.url} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        {/* Optional: Add video/image inline preview if desired */}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardWrapper>

      {/* Placeholder for Submissions Table */}
      <CardWrapper
        title="Student Submissions"
        description="Track and grade student submissions."
      >
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <Icon
            icon="lucide:inbox"
            className="w-10 h-10 mx-auto mb-2 opacity-50"
          />
          <p>No submissions yet.</p>
          <Button variant="light" color="primary" className="mt-2">
            View All Submissions
          </Button>
        </div>
      </CardWrapper>
    </div>
  );
}

function AssignmentDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardBody className="p-6">
          <div className="space-y-4">
            <Skeleton className="w-1/3 h-8 rounded-lg" />
            <Skeleton className="w-1/6 h-5 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                <Skeleton className="w-full h-40 rounded-lg" />
                <Skeleton className="w-full h-40 rounded-lg" />
              </div>
              <div className="space-y-4">
                <Skeleton className="w-full h-60 rounded-lg" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AssignmentDetail id={id} />;
}
