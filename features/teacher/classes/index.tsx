"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Chip, Input, Button, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  description: string | null;
  students: number;
}

const fetchTeacherClasses = async (): Promise<TeacherClass[]> => {
  const response = await apiClient.get("/teacher/classes");
  return response.data;
};

export default function TeacherClasses() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: classes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: fetchTeacherClasses,
  });

  const filteredClasses =
    classes?.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 rounded-lg mb-2" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="hover:scale-105 transition-transform">
              <CardBody className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-5 w-16 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg mt-4" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-danger p-10">
        <Icon icon="lucide:alert-circle" className="text-4xl mx-auto mb-2" />
        <p>Failed to load classes. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your assigned classes and view student information
          </p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search classes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startContent={<Icon icon="lucide:search" />}
        isClearable
        onClear={() => setSearchQuery("")}
        className="max-w-md"
      />

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => (
            <Card
              key={classItem.id}
              isPressable
              onPress={() => router.push(`/classes-list/${classItem.id}`)} // Updated URL to match potential new structure
              className="hover:scale-105 transition-transform"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">
                      {classItem.name}
                    </h3>
                    <Chip size="sm" variant="flat" color="primary">
                      {classItem.code}
                    </Chip>
                  </div>
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
                    className="text-3xl text-primary"
                  />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                  {classItem.description || "No description provided."}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon="lucide:users" className="text-gray-500" />
                    <span>
                      {classItem.students} Student
                      {classItem.students !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    fullWidth
                    endContent={<Icon icon="lucide:arrow-right" />}
                  >
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardBody className="p-12 text-center">
                <Icon
                  icon="lucide:inbox"
                  className="text-6xl text-gray-400 mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  {classes && classes.length > 0
                    ? "No classes found matching your search."
                    : "You represent assigned to any classes yet."}
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
