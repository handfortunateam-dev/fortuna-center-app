"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody, Chip, Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTeacherSessions } from "@/services/attendanceService";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TeacherAttendancePage() {
  const router = useRouter();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["teacher-sessions"], 
    queryFn: getTeacherSessions,
  });

  const handleSessionClick = (sessionId: string) => {
    router.push(`/attendance/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

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

      {!sessions || sessions.length === 0 ? (
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
            const isCompleted = session.status === "completed";
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
                isPressable
                onPress={() => handleSessionClick(session.id)}
                className="border border-default-200 hover:border-primary hover:shadow-md transition-all"
              >
                <CardBody className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" variant="flat" color="secondary">
                          {session.classCode}
                        </Chip>
                        <Chip
                          size="sm"
                          color={isCompleted ? "success" : "primary"}
                          variant="dot"
                        >
                          {isCompleted ? "Completed" : "Scheduled"}
                        </Chip>
                      </div>
                      <h3 className="font-bold text-lg line-clamp-2">
                        {session.className}
                      </h3>
                    </div>
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
                        <div className="flex gap-2 text-xs">
                          <Chip size="sm" color="success" variant="flat">
                            ✓ {session.presentCount}
                          </Chip>
                          <Chip size="sm" color="warning" variant="flat">
                            ⏰ {session.lateCount}
                          </Chip>
                          <Chip size="sm" color="danger" variant="flat">
                            ✗ {session.absentCount}
                          </Chip>
                        </div>
                      </>
                    ) : (
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-2 text-center">
                        <span className="text-warning text-xs font-medium">
                          ⚠️ Attendance Not Marked
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end text-primary text-sm font-medium pt-2">
                    <span>
                      {hasAttendance ? "View/Edit" : "Mark Attendance"}
                    </span>
                    <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1" />
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
