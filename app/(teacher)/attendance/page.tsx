"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeacherSessions,
  updateSessionStatus,
} from "@/services/attendanceService";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TeacherAttendancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["teacher-sessions"],
    queryFn: getTeacherSessions,
  });

  const handleSessionClick = (sessionId: string) => {
    router.push(`/attendance/${sessionId}`);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status:
        | "scheduled"
        | "not_started"
        | "in_progress"
        | "completed"
        | "cancelled"
        | any;
    }) => updateSessionStatus(sessionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
    },
  });

  // Removed early return for isLoading so header shows immediately

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Heading as="h1" size="3xl" weight="bold">
            Mark Attendance
          </Heading>
          <Text color="muted">
            Select a session to mark attendance. Showing sessions for the next 7
            days.
          </Text>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus-circle" />}
          onPress={() => router.push("/attendance/create-session")}
        >
          Create Session
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-default-200">
              <CardBody className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="w-16 h-6 rounded-md" />
                      <Skeleton className="w-24 h-6 rounded-md" />
                    </div>
                    <Skeleton className="w-3/4 h-6 rounded-md" />
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <Skeleton className="w-32 h-4 rounded-md" />
                  <Skeleton className="w-40 h-4 rounded-md" />
                </div>

                <div className="h-px bg-default-200 w-full mt-4" />

                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-16 h-4 rounded-md" />
                    <Skeleton className="w-8 h-4 rounded-md" />
                  </div>
                  <Skeleton className="w-full h-12 rounded-lg" />
                </div>

                <div className="flex justify-end pt-2">
                  <Skeleton className="w-28 h-5 rounded-md" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <Card className="border border-default-200">
          <CardBody className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Icon
                icon="lucide:calendar-off"
                className="w-16 h-16 text-default-300"
              />
              <div className="text-center">
                <Heading as="h3" size="lg" className="mb-2">
                  No Upcoming Sessions
                </Heading>
                <Text color="muted">
                  You don't have any scheduled sessions in the next 7 days.
                </Text>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const hasAttendance = session.attendanceRecorded;
            const attendanceRate =
              session.studentCount > 0
                ? Math.round(
                    (session.attendedCount / session.studentCount) * 100,
                  )
                : 0;

            return (
              <Card
                key={session.id}
                className="border border-default-200 hover:border-primary hover:shadow-md transition-all"
              >
                <CardBody className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Chip size="sm" variant="flat" color="secondary">
                          {session.classCode}
                        </Chip>
                        <Chip
                          size="sm"
                          color={
                            session.status === "completed"
                              ? "success"
                              : session.status === "in_progress"
                                ? "primary"
                                : session.status === "cancelled"
                                  ? "danger"
                                  : "default"
                          }
                          variant="dot"
                        >
                          {session.status.replace("_", " ").toUpperCase()}
                        </Chip>
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2">
                        {session.className}
                      </h3>
                    </div>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                          <Icon
                            icon="lucide:more-vertical"
                            className="w-5 h-5 text-default-500"
                          />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Session actions"
                        onAction={(key) =>
                          updateStatusMutation.mutate({
                            sessionId: session.id,
                            status: key,
                          })
                        }
                      >
                        {session.status !== "in_progress" &&
                        session.status !== "completed" &&
                        session.status !== "cancelled" ? (
                          <DropdownItem
                            key="in_progress"
                            startContent={
                              <Icon
                                icon="lucide:play-circle"
                                className="text-primary"
                              />
                            }
                          >
                            Start Session
                          </DropdownItem>
                        ) : (
                          <DropdownItem key="hidden" className="hidden">
                            Hidden
                          </DropdownItem>
                        )}

                        {session.status === "in_progress" ? (
                          <DropdownItem
                            key="completed"
                            startContent={
                              <Icon
                                icon="lucide:check-circle"
                                className="text-success"
                              />
                            }
                          >
                            Complete Session
                          </DropdownItem>
                        ) : (
                          <DropdownItem key="hidden2" className="hidden">
                            Hidden
                          </DropdownItem>
                        )}

                        {session.status !== "cancelled" &&
                        session.status !== "completed" ? (
                          <DropdownItem
                            key="cancelled"
                            className="text-danger"
                            color="danger"
                            startContent={<Icon icon="lucide:x-circle" />}
                          >
                            Cancel Session
                          </DropdownItem>
                        ) : (
                          <DropdownItem key="hidden3" className="hidden">
                            Hidden
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-default-500">
                      <Icon icon="lucide:calendar" className="w-4 h-4" />
                      <span>
                        {new Date(session.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-default-500">
                      <Icon icon="lucide:clock" className="w-4 h-4" />
                      <span>
                        {session.startTime} - {session.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-default-200 w-full" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-default-500">Students</span>
                      <span className="font-semibold">
                        {session.studentCount}
                      </span>
                    </div>

                    {hasAttendance ? (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-default-500">Attendance</span>
                          <span className="font-semibold text-success">
                            {session.attendedCount}/{session.studentCount}
                          </span>
                        </div>
                        <div className="w-full bg-default-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              attendanceRate >= 75 ? "bg-success" : "bg-warning"
                            }`}
                            style={{ width: `${attendanceRate}%` }}
                          />
                        </div>
                        <div className="flex gap-2 text-xs mt-2">
                          <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            startContent={<Icon icon="lucide:check" />}
                          >
                            {session.presentCount}
                          </Chip>
                          <Chip
                            size="sm"
                            color="warning"
                            variant="flat"
                            startContent={<Icon icon="lucide:clock" />}
                          >
                            {session.lateCount}
                          </Chip>
                          <Chip
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<Icon icon="lucide:x" />}
                          >
                            {session.absentCount}
                          </Chip>
                        </div>
                      </>
                    ) : (
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-2 flex items-center justify-center gap-2">
                        <Icon
                          icon="lucide:alert-triangle"
                          className="text-warning w-4 h-4"
                        />
                        <span className="text-warning text-xs font-medium">
                          Attendance Not Marked
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => handleSessionClick(session.id)}
                      endContent={<Icon icon="lucide:arrow-right" />}
                    >
                      {hasAttendance ? "View/Edit" : "Mark Attendance"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
