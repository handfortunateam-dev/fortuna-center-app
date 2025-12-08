"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Chip,
  Input,
  Button,
  Tabs,
  Tab,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Mock data - replace with actual API calls
const mockAssignments = [
  {
    id: "1",
    title: "Algebra Quiz",
    class: "MATH101",
    className: "Mathematics 101",
    status: "published",
    dueDate: "2025-12-01",
    submissions: 15,
    total: 32,
    maxScore: 100,
  },
  {
    id: "2",
    title: "Essay: Shakespeare",
    class: "ENG201",
    className: "English Literature",
    status: "published",
    dueDate: "2025-11-30",
    submissions: 8,
    total: 28,
    maxScore: 100,
  },
  {
    id: "3",
    title: "Geometry Homework",
    class: "MATH101",
    className: "Mathematics 101",
    status: "draft",
    dueDate: "2025-12-05",
    submissions: 0,
    total: 32,
    maxScore: 50,
  },
  {
    id: "4",
    title: "Physics Lab Report",
    class: "PHY301",
    className: "Physics Advanced",
    status: "closed",
    dueDate: "2025-11-25",
    submissions: 24,
    total: 24,
    maxScore: 100,
  },
];

export default function TeacherAssignments() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      selectedTab === "all" || assignment.status === selectedTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage assignments for your classes
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
          onPress={() => router.push("/teacher/assignments/create")}
        >
          Create Assignment
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search assignments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startContent={<Icon icon="lucide:search" />}
        isClearable
        onClear={() => setSearchQuery("")}
        className="max-w-md"
      />

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="all" title="All Assignments" />
        <Tab key="published" title="Published" />
        <Tab key="draft" title="Drafts" />
        <Tab key="closed" title="Closed" />
      </Tabs>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card
            key={assignment.id}
            isPressable
            onPress={() =>
              router.push(`/teacher/assignments/${assignment.id}`)
            }
            className="hover:scale-[1.01] transition-transform"
          >
            <CardBody className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {assignment.title}
                    </h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getStatusColor(assignment.status) as any}
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </Chip>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:book" />
                      <span>{assignment.className}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:calendar" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:award" />
                      <span>Max Score: {assignment.maxScore}</span>
                    </div>
                  </div>

                  {assignment.status === "published" && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Submissions
                        </span>
                        <span className="font-semibold">
                          {assignment.submissions} / {assignment.total}
                        </span>
                      </div>
                      <Progress
                        value={(assignment.submissions / assignment.total) * 100}
                        color="primary"
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    endContent={<Icon icon="lucide:eye" />}
                  >
                    View
                  </Button>
                  {assignment.status === "published" && (
                    <Button
                      size="sm"
                      variant="flat"
                      endContent={<Icon icon="lucide:clipboard-check" />}
                    >
                      Grade
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <Card>
          <CardBody className="p-12 text-center">
            <Icon
              icon="lucide:inbox"
              className="text-6xl text-gray-400 mx-auto mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">
              No assignments found matching your criteria.
            </p>
            <Button
              color="primary"
              className="mt-4"
              startContent={<Icon icon="lucide:plus" />}
              onPress={() => router.push("/teacher/assignments/create")}
            >
              Create Your First Assignment
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
