"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  Chip,
  Accordion,
  AccordionItem,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { getStudentAttendance } from "@/services/attendanceService";

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "success";
    case "late":
      return "warning";
    case "absent":
      return "danger";
    case "excused":
      return "primary";
    case "sick":
      return "secondary";
    default:
      return "default";
  }
};

export default function StudentAttendancePage() {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["student-attendance-v2"],
    // In a real app, we'd pass the actual user ID from the session
    queryFn: () => getStudentAttendance("current-user-id"),
  });

  if (isLoading) {
    return <div>Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h1" size="3xl" weight="bold">
          My Attendance
        </Heading>
        <Text color="muted">
          Track your attendance record across all your enrolled classes.
        </Text>
      </div>

      <div className="space-y-4">
        {attendanceData?.map((item) => {
          const attendancePercentage =
            item.totalSessions > 0
              ? Math.round(
                  ((item.studentStats.present + item.studentStats.late) /
                    item.totalSessions) *
                    100,
                )
              : 0;

          return (
            <Card
              key={item.classId}
              className="border border-default-200 shadow-sm"
            >
              <CardBody className="p-0">
                <Accordion variant="splitted" className="px-0">
                  <AccordionItem
                    key="1"
                    aria-label={item.className}
                    title={
                      <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">
                            {item.className}
                          </span>
                          <span className="text-sm text-default-500">
                            {item.totalSessions} Sessions Total
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-bold text-lg ${attendancePercentage < 75 ? "text-danger" : "text-success"}`}
                            >
                              {attendancePercentage}%
                            </span>
                            <span className="text-xs text-default-400">
                              Attendance Rate
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                    subtitle={
                      <div className="w-full max-w-md mt-2">
                        <Progress
                          size="sm"
                          value={attendancePercentage}
                          color={
                            attendancePercentage < 75 ? "danger" : "success"
                          }
                          className="max-w-md"
                        />
                      </div>
                    }
                  >
                    <div className="pt-2 pb-4 px-2">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
                        <div className="bg-success-50 p-3 rounded-lg text-center">
                          <div className="text-success font-bold text-xl">
                            {item.studentStats.present}
                          </div>
                          <div className="text-xs text-default-600 uppercase">
                            Present
                          </div>
                        </div>
                        <div className="bg-warning-50 p-3 rounded-lg text-center">
                          <div className="text-warning font-bold text-xl">
                            {item.studentStats.late}
                          </div>
                          <div className="text-xs text-default-600 uppercase">
                            Late
                          </div>
                        </div>
                        <div className="bg-danger-50 p-3 rounded-lg text-center">
                          <div className="text-danger font-bold text-xl">
                            {item.studentStats.absent}
                          </div>
                          <div className="text-xs text-default-600 uppercase">
                            Absent
                          </div>
                        </div>
                        <div className="bg-primary-50 p-3 rounded-lg text-center">
                          <div className="text-primary font-bold text-xl">
                            {item.studentStats.excused}
                          </div>
                          <div className="text-xs text-default-600 uppercase">
                            Excused
                          </div>
                        </div>
                        <div className="bg-secondary-50 p-3 rounded-lg text-center">
                          <div className="text-secondary font-bold text-xl">
                            {item.studentStats.sick}
                          </div>
                          <div className="text-xs text-default-600 uppercase">
                            Sick
                          </div>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm text-default-500 mb-3 uppercase">
                        Recent History
                      </h4>
                      <div className="space-y-2">
                        {item.history.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="lucide:calendar"
                                className="text-default-400"
                              />
                              <span className="font-medium">
                                {new Date(
                                  record.session?.date || new Date(),
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {record.notes && (
                                <span className="text-xs text-default-400 italic bg-white px-2 py-1 rounded border border-default-200">
                                  {record.notes}
                                </span>
                              )}
                              <Chip
                                size="sm"
                                color={
                                  getStatusColor(record.status) as
                                    | "success"
                                    | "warning"
                                    | "danger"
                                    | "primary"
                                    | "secondary"
                                    | "default"
                                }
                                variant="flat"
                                className="capitalize"
                              >
                                {record.status}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
