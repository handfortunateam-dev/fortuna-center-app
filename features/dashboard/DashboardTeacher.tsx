"use client";

import { Icon } from "@iconify/react";
import { AuthUser } from "@/lib/auth/getAuthUser";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody, Chip, Button, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getTeacherDashboard } from "@/services/attendanceService";
import { useRouter } from "next/navigation";

interface DashboardTeacherProps {
  user: AuthUser | null;
}

export default function DashboardTeacher({ user }: DashboardTeacherProps) {
  const router = useRouter();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: getTeacherDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger" />
        <Text>Failed to load dashboard data</Text>
      </div>
    );
  }

  const {
    overview,
    todaySessions,
    attendanceStats,
    recentClasses,
    sessionsNeedingAttention,
  } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading as="h1" size="3xl" className="text-default-900">
            Teacher Dashboard
          </Heading>
          <Text color="muted" className="mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here's what's
            happening today.
          </Text>
        </div>
        <div className="glass-panel px-4 py-3 rounded-xl border border-default-200">
          <div className="flex items-center gap-2 text-default-500">
            <Icon icon="solar:user-bold-duotone" className="text-xl" />
            <span className="text-sm font-medium">Teacher</span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text color="muted" className="text-sm">
                  Total Classes
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {overview.totalClasses}
                </Heading>
              </div>
              <div className="bg-primary-50 p-3 rounded-lg">
                <Icon
                  icon="solar:book-2-bold-duotone"
                  className="w-6 h-6 text-primary"
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
                  Total Students
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {overview.totalStudents}
                </Heading>
              </div>
              <div className="bg-success-50 p-3 rounded-lg">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="w-6 h-6 text-success"
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
                  Today's Sessions
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {overview.todaySessionsCount}
                </Heading>
              </div>
              <div className="bg-warning-50 p-3 rounded-lg">
                <Icon
                  icon="solar:calendar-mark-bold-duotone"
                  className="w-6 h-6 text-warning"
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
                  This Week
                </Text>
                <Heading as="h3" size="2xl" weight="bold" className="mt-1">
                  {overview.weekSessionsCount}
                </Heading>
                <Text className="text-xs text-default-400">sessions</Text>
              </div>
              <div className="bg-secondary-50 p-3 rounded-lg">
                <Icon
                  icon="solar:calendar-bold-duotone"
                  className="w-6 h-6 text-secondary"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Attendance Stats */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Heading as="h3" size="lg" weight="semibold">
              This Week's Attendance
            </Heading>
            <Chip
              color={
                attendanceStats.attendanceRate >= 75 ? "success" : "warning"
              }
              variant="flat"
            >
              {attendanceStats.attendanceRate}% Rate
            </Chip>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-success-50 p-4 rounded-lg text-center">
              <div className="text-success font-bold text-2xl">
                {attendanceStats.present}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Present
              </div>
            </div>
            <div className="bg-warning-50 p-4 rounded-lg text-center">
              <div className="text-warning font-bold text-2xl">
                {attendanceStats.late}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Late
              </div>
            </div>
            <div className="bg-danger-50 p-4 rounded-lg text-center">
              <div className="text-danger font-bold text-2xl">
                {attendanceStats.absent}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Absent
              </div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-primary font-bold text-2xl">
                {attendanceStats.total}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                Total
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Today's Sessions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card className="border border-default-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading as="h3" size="lg" weight="semibold">
                Today's Sessions
              </Heading>
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => router.push("/attendance")}
              >
                View All
              </Button>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-8">
                <Icon
                  icon="solar:calendar-minimalistic-bold-duotone"
                  className="w-12 h-12 text-default-300 mx-auto mb-2"
                />
                <Text color="muted" className="text-sm">
                  No sessions scheduled for today
                </Text>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/attendance/${session.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2 rounded-lg">
                        <Icon
                          icon="solar:book-bold-duotone"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {session.className}
                        </p>
                        <p className="text-xs text-default-500">
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      color={
                        session.status === "completed" ? "success" : "primary"
                      }
                      variant="flat"
                    >
                      {session.status}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions & Alerts */}
        <Card className="border border-default-200">
          <CardBody className="p-6">
            <Heading as="h3" size="lg" weight="semibold" className="mb-4">
              Quick Actions
            </Heading>

            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="flat"
                color="primary"
                startContent={
                  <Icon icon="lucide:clipboard-check" className="w-5 h-5" />
                }
                onPress={() => router.push("/attendance")}
              >
                Mark Attendance
              </Button>

              <Button
                className="w-full justify-start"
                variant="flat"
                color="secondary"
                startContent={
                  <Icon icon="lucide:plus-circle" className="w-5 h-5" />
                }
                onPress={() => router.push("/attendance/create-session")}
              >
                Create New Session
              </Button>

              <Button
                className="w-full justify-start"
                variant="flat"
                color="success"
                startContent={
                  <Icon icon="lucide:clipboard-list" className="w-5 h-5" />
                }
                onPress={() => router.push("/classes-attendance")}
              >
                View Class Attendance
              </Button>
            </div>

            {/* Alerts */}
            {sessionsNeedingAttention.length > 0 && (
              <div className="mt-6">
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="lucide:alert-circle"
                      className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <Text weight="semibold" className="text-warning-700 mb-2">
                        Attention Needed
                      </Text>
                      <Text className="text-sm text-warning-700 mb-3">
                        {sessionsNeedingAttention.length} session(s) need
                        attendance marking
                      </Text>
                      <div className="space-y-2">
                        {sessionsNeedingAttention.map((session) => (
                          <div
                            key={session.sessionId}
                            className="text-xs bg-white rounded px-2 py-1.5 cursor-pointer hover:bg-warning-100 transition-colors"
                            onClick={() =>
                              router.push(`/attendance/${session.sessionId}`)
                            }
                          >
                            <span className="font-medium">
                              {session.classCode}
                            </span>{" "}
                            •{" "}
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* My Classes */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Heading as="h3" size="lg" weight="semibold">
              My Classes
            </Heading>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => router.push("/classes-list")}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 bg-default-50 rounded-lg hover:bg-default-100 transition-colors cursor-pointer border border-default-200"
                onClick={() => router.push(`/classes-list/${cls.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon
                      icon="solar:book-bookmark-bold-duotone"
                      className="w-6 h-6 text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="mb-1"
                    >
                      {cls.code}
                    </Chip>
                    <p className="font-semibold text-sm truncate">{cls.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
