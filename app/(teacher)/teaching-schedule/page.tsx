"use client";

import { Scheduler } from "@/features/scheduler";
import { Card, CardBody, Spinner, Chip } from "@heroui/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";

import { useGetIdentity } from "@/hooks/useGetIdentity";

export default function TeachingSchedulePage() {
  const { user, loading } = useGetIdentity();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner
            size="lg"
            color="primary"
            labelColor="primary"
            label="Preparing your calendar..."
          />
          <Text color="muted" className="animate-pulse">
            Loading teaching schedule...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl shadow-primary-200/50">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Chip
                size="sm"
                className="bg-white/20 text-white border-none backdrop-blur-md"
              >
                Teacher Access
              </Chip>
              <div className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" />
              <span className="text-xs font-medium text-primary-100 uppercase tracking-wider">
                Live Calendar
              </span>
            </div>
            <Heading
              as="h1"
              size="4xl"
              weight="bold"
              className="text-white mb-2"
            >
              Teaching Schedule
            </Heading>
            <Text className="text-primary-50 opacity-90 text-lg flex items-center gap-2">
              <Icon icon="lucide:user" className="w-5 h-5" />
              Assigned to:{" "}
              <span className="font-semibold">{user?.name || "Teacher"}</span>
            </Text>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Icon
                  icon="lucide:calendar-clock"
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <Text
                  size="sm"
                  className="text-primary-100 uppercase tracking-tighter font-bold"
                >
                  Current Period
                </Text>
                <Text size="lg" weight="semibold" className="text-white">
                  Full Academic Week
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Scheduler Card */}
        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white dark:bg-gray-900">
          <CardBody className="p-0">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-3">
                <Icon
                  icon="lucide:layout-grid"
                  className="w-5 h-5 text-primary-600"
                />
                <Text
                  weight="bold"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Class Schedule View
                </Text>
              </div>
              <div className="flex gap-2">
                <Chip size="sm" variant="dot" color="primary">
                  Weekly Format
                </Chip>
                <Chip size="sm" variant="dot" color="success">
                  Auto-Synced
                </Chip>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <Scheduler
                readOnly={true}
                initialFilters={{ teacherId: user?.id }}
                hideTeacherFilter={true}
              />
            </div>
          </CardBody>
        </Card>

        {/* Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg rounded-2xl bg-blue-50 dark:bg-blue-900/10">
            <CardBody className="p-5 flex flex-row items-start gap-4">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                <Icon icon="lucide:info" className="w-6 h-6" />
              </div>
              <div>
                <Text
                  weight="bold"
                  className="text-blue-900 dark:text-blue-100 mb-1"
                >
                  Schedule Sync
                </Text>
                <Text
                  size="sm"
                  className="text-blue-700 dark:text-blue-300 opacity-80"
                >
                  Your schedule is automatically updated based on class
                  assignments managed by administration.
                </Text>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-lg rounded-2xl bg-amber-50 dark:bg-amber-900/10">
            <CardBody className="p-5 flex flex-row items-start gap-4">
              <div className="bg-amber-100 dark:bg-amber-800/30 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
              </div>
              <div>
                <Text
                  weight="bold"
                  className="text-amber-900 dark:text-amber-100 mb-1"
                >
                  Conflicts
                </Text>
                <Text
                  size="sm"
                  className="text-amber-700 dark:text-amber-300 opacity-80"
                >
                  Notice a scheduling conflict? Please contact the registrar or
                  your department head immediately.
                </Text>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-lg rounded-2xl bg-success-50 dark:bg-success-900/10">
            <CardBody className="p-5 flex flex-row items-start gap-4">
              <div className="bg-success-100 dark:bg-success-800/30 p-3 rounded-xl text-success-600 dark:text-success-400">
                <Icon icon="lucide:mouse-pointer-2" className="w-6 h-6" />
              </div>
              <div>
                <Text
                  weight="bold"
                  className="text-success-900 dark:text-success-100 mb-1"
                >
                  Quick Access
                </Text>
                <Text
                  size="sm"
                  className="text-success-700 dark:text-success-300 opacity-80"
                >
                  Click on any class card to view session details, student list,
                  and start attendance recording.
                </Text>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
