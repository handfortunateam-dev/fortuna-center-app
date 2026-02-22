"use client";

import { Icon } from "@iconify/react";
import { AuthUser } from "@/lib/auth/getAuthUser";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody, Chip, Button, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getTeacherDashboard } from "@/services/attendanceService";
import { useRouter } from "next/navigation";
import StatCard from "@/components/ui/StatCard";

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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-5 w-80 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border border-default-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-24 rounded-lg mb-2" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Attendance Stats Skeleton */}
        <Card className="border border-default-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Today's Sessions & Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-default-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-40 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </CardBody>
          </Card>
          <Card className="border border-default-200">
            <CardBody className="p-6">
              <Skeleton className="h-7 w-32 rounded-lg mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* My Classes Skeleton */}
        <Card className="border border-default-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-32 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>
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
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s
            what&apos;s happening today.
          </Text>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Classes"
          value={overview.totalClasses.toString()}
          icon="solar:book-2-bold-duotone"
          bgColor="bg-primary-50 dark:bg-primary-500/10"
          textColor="text-primary"
          delay={0.1}
        />
        <StatCard
          title="Total Students"
          value={overview.totalStudents.toString()}
          icon="solar:users-group-rounded-bold-duotone"
          bgColor="bg-success-50 dark:bg-success-500/10"
          textColor="text-success"
          delay={0.2}
        />
        <StatCard
          title="Today's Sessions"
          value={overview.todaySessionsCount.toString()}
          icon="solar:calendar-mark-bold-duotone"
          bgColor="bg-warning-50 dark:bg-warning-500/10"
          textColor="text-warning"
          delay={0.3}
        />
        <StatCard
          title="This Week"
          value={overview.weekSessionsCount.toString()}
          icon="solar:calendar-bold-duotone"
          bgColor="bg-secondary-50 dark:bg-secondary-500/10"
          textColor="text-secondary"
          change="sessions"
          delay={0.4}
        />
      </div>

      {/* Attendance Stats */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Heading as="h3" size="lg" weight="semibold">
              This Week&apos;s Attendance
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
                Today&apos;s Sessions
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
