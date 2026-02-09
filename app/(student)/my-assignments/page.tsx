"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useStudentAssignments } from "@/services/studentPortalService";

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: response, isLoading } = useStudentAssignments();
  const assignments = response?.data || [];

  const [filter, setFilter] = useState<string>("all");

  const filteredAssignments = useMemo(() => {
    if (filter === "all") return assignments;
    if (filter === "pending")
      return assignments.filter(
        (a) => !a.submissionStatus || a.submissionStatus === "pending",
      );
    if (filter === "submitted")
      return assignments.filter(
        (a) =>
          a.submissionStatus === "submitted" || a.submissionStatus === "graded",
      );
    return assignments;
  }, [assignments, filter]);

  const getStatusColor = (submissionStatus: string | null) => {
    switch (submissionStatus) {
      case "graded":
        return "success";
      case "submitted":
        return "primary";
      case "late":
        return "danger";
      default:
        return "warning"; // pending
    }
  };

  const getStatusLabel = (submissionStatus: string | null) => {
    switch (submissionStatus) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "late":
        return "Missing / Late";
      default:
        return "To Do"; // pending
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500">
          Track and manage your class usage tasks.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Stats / Overview */}
        <div className="w-full md:w-1/4 space-y-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
            <CardBody>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon icon="lucide:check-circle" className="w-6 h-6" />
                </div>
                <span className="font-medium">Completion Rate</span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {assignments.length > 0
                  ? Math.round(
                      (assignments.filter(
                        (a) =>
                          a.submissionStatus === "submitted" ||
                          a.submissionStatus === "graded",
                      ).length /
                        assignments.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <Progress
                size="sm"
                value={
                  assignments.length > 0
                    ? (assignments.filter(
                        (a) =>
                          a.submissionStatus === "submitted" ||
                          a.submissionStatus === "graded",
                      ).length /
                        assignments.length) *
                      100
                    : 0
                }
                color="warning"
                aria-label="Attendance"
                className="max-w-md"
              />
              <p className="text-xs text-white/80 mt-2">
                {
                  assignments.filter(
                    (a) =>
                      a.submissionStatus === "submitted" ||
                      a.submissionStatus === "graded",
                  ).length
                }{" "}
                of {assignments.length} assignments completed
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="font-semibold text-gray-700 pb-0">
              Filters
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                variant={filter === "all" ? "solid" : "light"}
                color="primary"
                className="justify-start w-full"
                onPress={() => setFilter("all")}
              >
                All Assignments
              </Button>
              <Button
                variant={filter === "pending" ? "solid" : "light"}
                color="warning"
                className="justify-start w-full"
                onPress={() => setFilter("pending")}
              >
                To Do (Pending)
              </Button>
              <Button
                variant={filter === "submitted" ? "solid" : "light"}
                color="success"
                className="justify-start w-full"
                onPress={() => setFilter("submitted")}
              >
                Completed
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Assignment Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="flex flex-col items-start gap-2 pb-0">
                  <div className="flex justify-between w-full items-start">
                    <Chip
                      size="sm"
                      color={getStatusColor(assignment.submissionStatus)}
                      variant="flat"
                    >
                      {getStatusLabel(assignment.submissionStatus)}
                    </Chip>
                    {assignment.submissionScore !== null && (
                      <Chip size="sm" color="success" variant="solid">
                        {assignment.submissionScore} / {assignment.maxScore}
                      </Chip>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
                    {assignment.title}
                  </h3>
                </CardHeader>
                <CardBody className="py-2">
                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="lucide:school" className="w-4 h-4" />
                      <span>{assignment.className}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:calendar" className="w-4 h-4" />
                      <span>
                        {assignment.dueDate
                          ? `Due ${format(new Date(assignment.dueDate), "MMM d, yyyy")}`
                          : "No Due Date"}
                      </span>
                    </div>
                  </div>
                  <Divider className="my-2" />
                </CardBody>
                <div className="p-3 pt-0">
                  <Button
                    color="primary"
                    variant={
                      assignment.submissionStatus === "graded"
                        ? "bordered"
                        : "solid"
                    }
                    fullWidth
                    onPress={() =>
                      router.push(`/student/assignments/${assignment.id}`)
                    }
                  >
                    {assignment.submissionStatus === "graded"
                      ? "View Feedback"
                      : "View & Submit"}
                  </Button>
                </div>
              </Card>
            ))}

            {filteredAssignments.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
                <Icon
                  icon="lucide:inbox"
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                />
                <p>No assignments found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
