"use client";

import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default function TeacherDashboard() {
  const stats = [
    {
      title: "My Classes",
      value: "5",
      icon: "solar:book-bookmark-bold-duotone",
      color: "bg-blue-500",
    },
    {
      title: "Active Assignments",
      value: "12",
      icon: "solar:document-text-bold-duotone",
      color: "bg-green-500",
    },
    {
      title: "Pending Submissions",
      value: "28",
      icon: "solar:clock-circle-bold-duotone",
      color: "bg-orange-500",
    },
    {
      title: "Total Students",
      value: "156",
      icon: "solar:users-group-rounded-bold-duotone",
      color: "bg-purple-500",
    },
  ];

  const recentClasses = [
    { id: 1, name: "Mathematics 101", code: "MATH101", students: 32 },
    { id: 2, name: "English Literature", code: "ENG201", students: 28 },
    { id: 3, name: "Physics Advanced", code: "PHY301", students: 24 },
  ];

  const pendingAssignments = [
    {
      id: 1,
      title: "Algebra Quiz",
      class: "MATH101",
      dueDate: "2025-12-01",
      submissions: 15,
      total: 32,
    },
    {
      id: 2,
      title: "Essay: Shakespeare",
      class: "ENG201",
      dueDate: "2025-11-30",
      submissions: 8,
      total: 28,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h1" size="3xl" weight="bold">
          Teacher Dashboard
        </Heading>
        <Text color="muted">
          Welcome back! Here&apos;s what&apos;s happening with your classes.
        </Text>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon icon={stat.icon} className="text-2xl text-white" />
                </div>
                <div>
                  <Text size="sm" color="muted">
                    {stat.title}
                  </Text>
                  <Text className="text-2xl" weight="bold">
                    {stat.value}
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classes */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading as="h2" size="xl" weight="semibold">
                My Classes
              </Heading>
              <Chip size="sm" variant="flat">
                {recentClasses.length} Active
              </Chip>
            </div>
            <div className="space-y-3">
              {recentClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div>
                    <Text weight="semibold" as="div">
                      {classItem.name}
                    </Text>
                    <Text size="sm" color="muted" as="div">
                      {classItem.code}
                    </Text>
                  </div>
                  <Chip size="sm" variant="flat" color="primary">
                    {classItem.students} Students
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Pending Assignments */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading as="h2" size="xl" weight="semibold">
                Pending Assignments
              </Heading>
              <Chip size="sm" variant="flat" color="warning">
                {pendingAssignments.length} Pending
              </Chip>
            </div>
            <div className="space-y-3">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Text weight="semibold" as="div">
                        {assignment.title}
                      </Text>
                      <Text size="sm" color="muted" as="div">
                        {assignment.class}
                      </Text>
                    </div>
                    <Chip size="sm" variant="flat">
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(assignment.submissions / assignment.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {assignment.submissions}/{assignment.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
