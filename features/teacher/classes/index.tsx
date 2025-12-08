"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Chip, Input, Button, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

// Mock data - replace with actual API calls
const mockClasses = [
  {
    id: "1",
    name: "Mathematics 101",
    code: "MATH101",
    description: "Introduction to Mathematics",
    students: 32,
    assignments: 5,
  },
  {
    id: "2",
    name: "English Literature",
    code: "ENG201",
    description: "Advanced English Literature",
    students: 28,
    assignments: 3,
  },
  {
    id: "3",
    name: "Physics Advanced",
    code: "PHY301",
    description: "Advanced Physics Concepts",
    students: 24,
    assignments: 4,
  },
];

export default function TeacherClasses() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = mockClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {filteredClasses.map((classItem) => (
          <Card
            key={classItem.id}
            isPressable
            onPress={() => router.push(`/teacher/classes/${classItem.id}`)}
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

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {classItem.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon="lucide:users" className="text-gray-500" />
                  <span>
                    {classItem.students} Student
                    {classItem.students !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon="lucide:clipboard-list" className="text-gray-500" />
                  <span>
                    {classItem.assignments} Assignment
                    {classItem.assignments !== 1 ? "s" : ""}
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
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card>
          <CardBody className="p-12 text-center">
            <Icon
              icon="lucide:inbox"
              className="text-6xl text-gray-400 mx-auto mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">
              No classes found matching your search.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
