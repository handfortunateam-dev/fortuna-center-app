"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  AvatarGroup,
  Image,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useStudentClassDetail } from "@/services/studentPortalService";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: response, isLoading } = useStudentClassDetail(id);
  const classData = response?.data;

  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Icon
          icon="solar:forbidden-circle-bold-duotone"
          className="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 className="text-xl font-bold text-gray-700">Class Not Found</h2>
        <Button className="mt-4" onPress={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
        {classData.bannerUrl ? (
          <Image
            src={classData.bannerUrl}
            alt={classData.name}
            classNames={{
              wrapper: "w-full h-full",
              img: "w-full h-full object-cover",
            }}
            radius="none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Icon
              icon="solar:black-hole-bold"
              className="w-32 h-32 text-white"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-mono tracking-wider">
                  {classData.code}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {classData.name}
              </h1>
            </div>
            {/* Teachers Avatars */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm text-white/80">Instructors</span>
              <AvatarGroup isBordered max={3} size="sm">
                {classData.teachers.map((t, idx) => (
                  <Avatar key={idx} src={t.image || undefined} name={t.name} />
                ))}
              </AvatarGroup>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="light"
          startContent={<Icon icon="solar:arrow-left-linear" />}
          onPress={() => router.push("/my-class")}
        >
          Back to Classes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon
                  icon="solar:info-circle-bold-duotone"
                  className="text-primary"
                />
                About this Class
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {classData.description || "No description provided."}
              </p>
            </CardBody>
          </Card>

          {/* Placeholder for future content like Stream, Resources, etc. */}
          <Tabs aria-label="Class Options" variant="underlined" color="primary">
            <Tab key="stream" title="Stream">
              <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                <Icon
                  icon="solar:chat-square-like-bold-duotone"
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                />
                <p>No recent activity.</p>
              </div>
            </Tab>
            <Tab key="resources" title="Resources">
              <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                <Icon
                  icon="solar:folder-with-files-bold-duotone"
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                />
                <p>No files uploaded yet.</p>
              </div>
            </Tab>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Classmates Card */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="text-blue-500"
                />
                Classmates
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {classData.classmates.length}
              </span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {classData.classmates.map((student, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar
                      src={student.image || undefined}
                      name={student.name}
                      size="sm"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <CardBody className="p-6">
              <h4 className="font-bold text-lg mb-2">Quick Actions</h4>
              <div className="flex flex-col gap-2">
                <Button
                  className="bg-white/20 backdrop-blur-md text-white justify-start"
                  startContent={
                    <Icon icon="solar:checklist-minimalistic-bold-duotone" />
                  }
                  onPress={() => router.push("/my-assignments")}
                >
                  View Assignments
                </Button>
                <Button
                  className="bg-white/20 backdrop-blur-md text-white justify-start"
                  startContent={<Icon icon="solar:calendar-bold-duotone" />}
                >
                  Class Schedule
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
