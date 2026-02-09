"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { getClassAttendance } from "@/services/attendanceService";

const getStatusColor = (status: string | null) => {
  if (!status) return "default";
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

const getStatusIcon = (status: string | null) => {
  if (!status) return "lucide:circle";
  switch (status) {
    case "present":
      return "lucide:check-circle";
    case "late":
      return "lucide:clock";
    case "absent":
      return "lucide:x-circle";
    case "excused":
      return "lucide:file-check";
    case "sick":
      return "lucide:heart-pulse";
    default:
      return "lucide:circle";
  }
};

export default function ClassAttendancePage() {
  const params = useParams();
  const classId = params.classId as string;
  const [viewMode, setViewMode] = useState<"overview" | "details">("overview");

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["class-attendance", classId],
    queryFn: () => getClassAttendance(classId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger" />
        <Text>Failed to load attendance data</Text>
      </div>
    );
  }

  const {
    class: classInfo,
    sessions,
    totalStudents,
    attendanceData: students,
  } = attendanceData;

  // Calculate overall statistics
  const overallStats = students.reduce(
    (acc, student) => {
      acc.present += student.stats.present;
      acc.late += student.stats.late;
      acc.absent += student.stats.absent;
      acc.excused += student.stats.excused;
      acc.sick += student.stats.sick;
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0, sick: 0 },
  );

  const totalRecords = Object.values(overallStats).reduce((a, b) => a + b, 0);
  const overallAttendanceRate =
    totalRecords > 0
      ? Math.round(
          ((overallStats.present + overallStats.late) / totalRecords) * 100,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text color="muted" className="text-sm">
                  Total Students
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {totalStudents}
                </Heading>
              </div>
              <div className="bg-primary-50 p-3 rounded-lg">
                <Icon icon="lucide:users" className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text color="muted" className="text-sm">
                  Total Sessions
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {sessions.length}
                </Heading>
              </div>
              <div className="bg-secondary-50 p-3 rounded-lg">
                <Icon
                  icon="lucide:calendar"
                  className="w-6 h-6 text-secondary"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text color="muted" className="text-sm">
                  Attendance Rate
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {overallAttendanceRate}%
                </Heading>
              </div>
              <div
                className={`${overallAttendanceRate >= 75 ? "bg-success-50" : "bg-danger-50"} p-3 rounded-lg`}
              >
                <Icon
                  icon="lucide:trending-up"
                  className={`w-6 h-6 ${overallAttendanceRate >= 75 ? "text-success" : "text-danger"}`}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text color="muted" className="text-sm">
                  Total Records
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {totalRecords}
                </Heading>
              </div>
              <div className="bg-warning-50 p-3 rounded-lg">
                <Icon
                  icon="lucide:clipboard-check"
                  className="w-6 h-6 text-warning"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Statistics Summary */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <Heading as="h3" size="lg" weight="semibold" className="mb-4">
            Overall Statistics
          </Heading>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-success-50 p-4 rounded-lg text-center">
              <div className="text-success font-bold text-2xl">
                {overallStats.present}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Present
              </div>
            </div>
            <div className="bg-warning-50 p-4 rounded-lg text-center">
              <div className="text-warning font-bold text-2xl">
                {overallStats.late}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Late
              </div>
            </div>
            <div className="bg-danger-50 p-4 rounded-lg text-center">
              <div className="text-danger font-bold text-2xl">
                {overallStats.absent}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Absent
              </div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-primary font-bold text-2xl">
                {overallStats.excused}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Excused
              </div>
            </div>
            <div className="bg-secondary-50 p-4 rounded-lg text-center">
              <div className="text-secondary font-bold text-2xl">
                {overallStats.sick}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Sick
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* View Mode Tabs */}
      <div className="flex justify-between items-center">
        <Tabs
          selectedKey={viewMode}
          onSelectionChange={(key) =>
            setViewMode(key as "overview" | "details")
          }
        >
          <Tab key="overview" title="Student Overview" />
          <Tab key="details" title="Session Details" />
        </Tabs>

        <Button
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:download" />}
        >
          Export Report
        </Button>
      </div>

      {/* Content based on view mode */}
      {viewMode === "overview" ? (
        <Card className="border border-default-200">
          <CardBody className="p-0">
            <Table aria-label="Student attendance overview" removeWrapper>
              <TableHeader>
                <TableColumn>STUDENT</TableColumn>
                <TableColumn align="center">ATTENDANCE RATE</TableColumn>
                <TableColumn align="center">PRESENT</TableColumn>
                <TableColumn align="center">LATE</TableColumn>
                <TableColumn align="center">ABSENT</TableColumn>
                <TableColumn align="center">EXCUSED</TableColumn>
                <TableColumn align="center">SICK</TableColumn>
              </TableHeader>
              <TableBody>
                {students.map((studentData) => (
                  <TableRow key={studentData.student.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {studentData.student.name || "N/A"}
                        </span>
                        <span className="text-xs text-default-400">
                          {studentData.student.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`font-bold ${studentData.attendanceRate < 75 ? "text-danger" : "text-success"}`}
                        >
                          {studentData.attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip size="sm" color="success" variant="flat">
                          {studentData.stats.present}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip size="sm" color="warning" variant="flat">
                          {studentData.stats.late}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip size="sm" color="danger" variant="flat">
                          {studentData.stats.absent}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip size="sm" color="primary" variant="flat">
                          {studentData.stats.excused}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Chip size="sm" color="secondary" variant="flat">
                          {studentData.stats.sick}
                        </Chip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        <Card className="border border-default-200">
          <CardBody className="p-0 overflow-x-auto">
            <Table aria-label="Detailed attendance by session" removeWrapper>
              <TableHeader>
                {[
                  <TableColumn key="student" className="min-w-[200px]">
                    STUDENT
                  </TableColumn>,
                  ...sessions.map((session) => (
                    <TableColumn
                      key={session.id}
                      align="center"
                      className="min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">
                          {new Date(session.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        <Chip
                          size="sm"
                          color={
                            session.status === "completed"
                              ? "success"
                              : "default"
                          }
                          variant="dot"
                          className="text-xs"
                        >
                          {session.status}
                        </Chip>
                      </div>
                    </TableColumn>
                  )),
                ]}
              </TableHeader>
              <TableBody>
                {students.map((studentData) => (
                  <TableRow key={studentData.student.id}>
                    {[
                      <TableCell key="student-info">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {studentData.student.name || "N/A"}
                          </span>
                          <span className="text-xs text-default-400">
                            {studentData.attendanceRate}% rate
                          </span>
                        </div>
                      </TableCell>,
                      ...studentData.attendance.map((record, index) => (
                        <TableCell key={`${studentData.student.id}-${index}`}>
                          <div className="flex justify-center">
                            {record.attendanceStatus ? (
                              <Tooltip
                                content={
                                  <div className="p-2">
                                    <div className="font-semibold capitalize">
                                      {record.attendanceStatus}
                                    </div>
                                    {record.notes && (
                                      <div className="text-xs text-default-500 mt-1">
                                        {record.notes}
                                      </div>
                                    )}
                                    {record.checkedInAt && (
                                      <div className="text-xs text-default-400 mt-1">
                                        Checked in:{" "}
                                        {new Date(
                                          record.checkedInAt,
                                        ).toLocaleTimeString()}
                                      </div>
                                    )}
                                  </div>
                                }
                              >
                                <Chip
                                  size="sm"
                                  color={
                                    getStatusColor(record.attendanceStatus) as
                                      | "success"
                                      | "warning"
                                      | "danger"
                                      | "primary"
                                      | "secondary"
                                      | "default"
                                  }
                                  variant="flat"
                                  startContent={
                                    <Icon
                                      icon={getStatusIcon(
                                        record.attendanceStatus,
                                      )}
                                      className="w-3 h-3"
                                    />
                                  }
                                  className="cursor-pointer"
                                >
                                  {record.attendanceStatus
                                    .charAt(0)
                                    .toUpperCase()}
                                </Chip>
                              </Tooltip>
                            ) : (
                              <Chip
                                size="sm"
                                variant="bordered"
                                color="default"
                              >
                                -
                              </Chip>
                            )}
                          </div>
                        </TableCell>
                      )),
                    ]}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
