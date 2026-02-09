"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  Image,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useStudentClasses } from "@/services/studentPortalService";

export default function MyClassPage() {
  const router = useRouter();
  const { data: response, isLoading } = useStudentClasses();
  const classes = response?.data || [];

  if (isLoading) {
    return <div className="p-8 text-center">Loading classes...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500">
          View your enrolled classes, teachers, and classmates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="group hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Banner Placeholder or Image */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden">
              {cls.bannerUrl ? (
                <Image
                  src={cls.bannerUrl}
                  alt={cls.name}
                  classNames={{
                    wrapper: "w-full h-full",
                    img: "w-full h-full object-cover",
                  }}
                  radius="none"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Icon icon="lucide:school" className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Chip
                  size="sm"
                  color="default"
                  variant="solid"
                  className="bg-white/90"
                >
                  {cls.code}
                </Chip>
              </div>
            </div>

            <CardHeader className="pb-0 pt-4 flex-col items-start px-4">
              <h2 className="text-xl font-bold text-gray-800 line-clamp-1">
                {cls.name}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <span className="font-medium">Teachers:</span>
                <div className="flex -space-x-2">
                  {cls.teachers.length > 0 ? (
                    cls.teachers.map((t, i) => (
                      <Avatar
                        key={i}
                        size="sm"
                        src={t.image || undefined}
                        name={t.name}
                        title={t.name}
                        className="border-2 border-white w-6 h-6 text-tiny"
                      />
                    ))
                  ) : (
                    <span className="text-gray-400 italic">None assigned</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardBody className="px-4 py-3">
              <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-4">
                {cls.description || "No description provided for this class."}
              </p>

              <Divider className="my-2" />

              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Classmates ({cls.classmates.length})
                </p>
                <AvatarGroup
                  isBordered
                  max={5}
                  size="sm"
                  className="justify-start"
                >
                  {cls.classmates.map((student) => (
                    <Avatar
                      key={student.id}
                      src={student.image || undefined}
                      name={student.name}
                      title={student.name}
                    />
                  ))}
                </AvatarGroup>
              </div>
            </CardBody>

            <CardFooter className="gap-2 px-4 pb-4 pt-0">
              <Button
                color="primary"
                variant="solid"
                fullWidth
                onPress={() => router.push(`/my-class/${cls.id}`)}
                className="font-medium"
              >
                View Class
              </Button>
            </CardFooter>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
            <Icon
              icon="lucide:book-open-check"
              className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400"
            />
            <h3 className="text-lg font-medium text-gray-900">
              No Classes Found
            </h3>
            <p className="mt-1 text-sm">
              You are not enrolled in any classes yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
