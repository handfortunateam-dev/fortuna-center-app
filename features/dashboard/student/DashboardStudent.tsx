"use client";

import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import { AuthUser } from "@/lib/auth/getAuthUser";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  AvatarGroup,
  Progress,
  Chip,
  Divider,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  useStudentAssignments,
  useStudentClasses,
} from "@/services/studentPortalService";
import { format } from "date-fns";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

interface DashboardStudentProps {
  user: AuthUser | null;
}

export default function DashboardStudent({ user }: DashboardStudentProps) {
  const router = useRouter();
  const { data: assignmentsData, isLoading: isLoadingAssignments } =
    useStudentAssignments();
  const { data: classesData, isLoading: isLoadingClasses } =
    useStudentClasses();

  const assignments = assignmentsData?.data || [];
  const classes = classesData?.data || [];

  // Metrics
  const pendingAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => !a.submissionStatus || a.submissionStatus === "pending",
      ),
    [assignments],
  );

  const completedAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.submissionStatus === "submitted" || a.submissionStatus === "graded",
      ),
    [assignments],
  );

  const upcomingAssignments = useMemo(
    () =>
      pendingAssignments
        .filter((a) => a.dueDate && new Date(a.dueDate) > new Date())
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
        )
        .slice(0, 3),
    [pendingAssignments],
  );

  const completionRate =
    assignments.length > 0
      ? Math.round((completedAssignments.length / assignments.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" size="3xl" className="text-gray-900">
            Dashboard
          </Heading>
          <Text color="muted" className="mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here's what's
            happening today.
          </Text>
        </div>
        <div className="glass-panel px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm md:w-auto w-full">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Icon
                  icon="solar:calendar-date-bold-duotone"
                  className="text-xl"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Today
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {format(new Date(), "EEEE, MMM d")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Icon
                  icon="solar:checklist-minimalistic-bold-duotone"
                  className="w-6 h-6"
                />
              </div>
              <span className="font-medium opacity-90">Assignments To Do</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <Heading as="h2" size="4xl">
                  {pendingAssignments.length}
                </Heading>
                <Text size="sm" color="white" className="opacity-80 mt-1">
                  Pending tasks
                </Text>
              </div>
              <div className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  color="default"
                  className="text-white hover:bg-white/20"
                  onPress={() => router.push("/my-assignments")}
                >
                  View All
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Icon
                    icon="solar:pie-chart-2-bold-duotone"
                    className="w-6 h-6"
                  />
                </div>
                <span className="font-medium text-gray-700">
                  Completion Rate
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </span>
            </div>
            <Progress
              value={completionRate}
              color="success"
              size="md"
              className="mb-2"
              aria-label="Completion Rate"
            />
            <p className="text-xs text-gray-500">
              {completedAssignments.length} out of {assignments.length}{" "}
              assignments done
            </p>
          </CardBody>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Icon
                  icon="solar:notebook-bookmark-bold-duotone"
                  className="w-6 h-6"
                />
              </div>
              <span className="font-medium text-gray-700">My Classes</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <Heading as="h2" size="3xl" className="text-gray-900">
                  {classes.length}
                </Heading>
                <Text size="sm" color="muted" className="mt-1">
                  Enrolled classes
                </Text>
              </div>
              <AvatarGroup isBordered max={3} size="sm">
                {classes
                  .slice(0, 3)
                  .flatMap((c) => c.teachers)
                  .map((t, idx) => (
                    <Avatar
                      key={idx}
                      src={t.image || undefined}
                      name={t.name}
                    />
                  ))}
              </AvatarGroup>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <div className="lg:col-span-2 space-y-4">
          <Heading
            as="h3"
            size="lg"
            className="text-gray-800 flex items-center gap-2"
          >
            <Icon
              icon="solar:bell-bing-bold-duotone"
              className="text-orange-500"
            />
            Upcoming Deadlines
          </Heading>

          {upcomingAssignments.length > 0 ? (
            <div className="grid gap-3">
              {upcomingAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="border border-gray-100 hover:border-blue-200 transition-colors shadow-sm group"
                  isPressable
                  onPress={() =>
                    router.push(`/my-assignments/${assignment.id}`)
                  }
                >
                  <CardBody className="flex flex-row items-center gap-4 p-4">
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon
                        icon="solar:document-text-bold-duotone"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {assignment.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:book-2-linear" />{" "}
                          {assignment.className}
                        </span>
                        <span className="flex items-center gap-1 text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                          <Icon icon="solar:clock-circle-bold" /> Due{" "}
                          {assignment.dueDate
                            ? format(new Date(assignment.dueDate), "MMM d, p")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="text-gray-300 group-hover:text-blue-500"
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-gray-200 bg-gray-50/50 shadow-none">
              <CardBody className="py-8 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    className="text-2xl"
                  />
                </div>
                <h4 className="font-semibold text-gray-800">All caught up!</h4>
                <p className="text-gray-500 text-sm mt-1">
                  You have no upcoming deadlines.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Recent Classes / Quick Access */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading
              as="h3"
              size="lg"
              className="text-gray-800 flex items-center gap-2"
            >
              <Icon
                icon="solar:black-hole-bold-duotone"
                className="text-purple-500"
              />
              My Classes
            </Heading>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => router.push("/my-class")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {isLoadingClasses ? (
              <div className="text-center py-4 text-gray-400">Loading...</div>
            ) : (
              classes.slice(0, 4).map((cls) => (
                <div
                  key={cls.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/my-class/${cls.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-lg shadow-sm">
                      {cls.code.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {cls.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {cls.teachers.map((t) => t.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {classes.length === 0 && !isLoadingClasses && (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                <p>No classes enrolled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
