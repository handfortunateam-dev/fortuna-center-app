"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  User,
  Button,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface Student {
  id: string;
  name: string;
  email: string;
  image: string | null;
  enrolledAt: string;
}

interface ClassDetailsData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  students: Student[];
}

const fetchClassDetails = async (
  classId: string,
): Promise<ClassDetailsData> => {
  const response = await apiClient.get<ClassDetailsData>(
    `/teacher/classes/${classId}`,
  );
  return response.data;
};

export default function ClassDetails({ classId }: { classId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teacher-class-details", classId],
    queryFn: () => fetchClassDetails(classId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="px-6 py-4">
                <Skeleton className="h-6 w-48 rounded-lg" />
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border-b border-default-100 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-48 rounded-lg" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="px-6 py-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
              </CardHeader>
              <Divider />
              <CardBody className="px-6 py-4">
                <Skeleton className="h-4 w-full rounded-lg mb-2" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="px-6 py-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
              </CardHeader>
              <Divider />
              <CardBody className="p-4 space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-danger p-10">
        <Icon icon="lucide:alert-circle" className="text-4xl mx-auto mb-2" />
        <p>Failed to load class details.</p>
        <Button
          className="mt-4"
          variant="light"
          onPress={() => router.back()}
          startContent={<Icon icon="lucide:arrow-left" />}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          aria-label="Go back"
        >
          <Icon icon="lucide:arrow-left" className="text-xl" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <div className="flex items-center gap-2 text-default-500 text-sm">
            <span className="font-mono bg-default-100 px-2 py-0.5 rounded">
              {data.code}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Students List) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex justify-between px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="lucide:users" />
                Enrolled Students ({data.students.length})
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              {data.students.length > 0 ? (
                <div className="flex flex-col">
                  {data.students.map((student, index) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 hover:bg-default-50 transition-colors border-b border-default-100 last:border-none`}
                    >
                      <User
                        name={student.name}
                        description={student.email}
                        avatarProps={{
                          src: student.image || undefined,
                          // fallback: student.name.charAt(0)
                        }}
                      />
                      <div className="text-xs text-default-400">
                        Enrolled:{" "}
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-default-400">
                  No students enrolled yet.
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar (Actions & Info) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="px-6 py-4 font-semibold">
              Description
            </CardHeader>
            <Divider />
            <CardBody className="px-6 py-4">
              <p className="text-sm text-default-600">
                {data.description || "No description provided."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="px-6 py-4 font-semibold">
              Quick Actions
            </CardHeader>
            <Divider />
            <CardBody className="p-4 space-y-2">
              <Button
                fullWidth
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:calendar-mark-bold-duotone" />}
                onPress={() => router.push(`/attendance`)}
              >
                Mark Attendance
              </Button>
              <Button
                fullWidth
                color="secondary"
                variant="flat"
                startContent={<Icon icon="solar:document-text-bold-duotone" />}
                onPress={() => router.push(`/assignments-for-classes`)}
              >
                Assignments
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
