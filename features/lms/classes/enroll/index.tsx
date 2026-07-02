"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface ClassEnrollProps {
  classId: string;
}

// Mock data - replace with actual API calls
const mockClass = {
  id: "1",
  name: "Mathematics 101",
  code: "MATH101",
  description: "Introduction to Mathematics",
};

const mockStudents = [
  { id: "1", name: "John Doe", email: "john@example.com", enrolled: false },
  { id: "2", name: "Jane Smith", email: "jane@example.com", enrolled: true },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", enrolled: false },
];

const mockTeachers = [
  { id: "1", name: "Prof. Smith", email: "smith@example.com", assigned: false },
  { id: "2", name: "Dr. Johnson", email: "johnson@example.com", assigned: true },
];

export default function ClassEnroll({ classId }: ClassEnrollProps) {
  const router = useRouter();
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleEnrollStudents = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/classes/${classId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
        }),
      });

      if (response.ok) {
        setSelectedStudents(new Set());
        // Refresh data
      }
    } catch (error) {
      console.error("Error enrolling students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeachers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/classes/${classId}/assign-teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherIds: Array.from(selectedTeachers),
        }),
      });

      if (response.ok) {
        setSelectedTeachers(new Set());
        // Refresh data
      }
    } catch (error) {
      console.error("Error assigning teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          variant="light"
          startContent={<Icon icon="lucide:arrow-left" />}
          onPress={() => router.back()}
        >
          Back to Classes
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{mockClass.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Code: {mockClass.code} | {mockClass.description}
        </p>
      </div>

      <Tabs aria-label="Enrollment options">
        <Tab key="students" title="Students">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">Enroll Students</h2>

              <div className="space-y-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Available Students</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mockStudents
                      .filter((s) => !s.enrolled)
                      .map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            color="primary"
                            variant={
                              selectedStudents.has(student.id)
                                ? "solid"
                                : "bordered"
                            }
                            onPress={() => {
                              const newSelected = new Set(selectedStudents);
                              if (newSelected.has(student.id)) {
                                newSelected.delete(student.id);
                              } else {
                                newSelected.add(student.id);
                              }
                              setSelectedStudents(newSelected);
                            }}
                          >
                            {selectedStudents.has(student.id)
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Enrolled Students</h3>
                  <div className="space-y-2">
                    {mockStudents
                      .filter((s) => s.enrolled)
                      .map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900/20 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                          <Chip size="sm" color="success" variant="flat">
                            Enrolled
                          </Chip>
                        </div>
                      ))}
                  </div>
                </div>

                {selectedStudents.size > 0 && (
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="light"
                      onPress={() => setSelectedStudents(new Set())}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      color="primary"
                      isLoading={loading}
                      onPress={handleEnrollStudents}
                      startContent={
                        !loading && <Icon icon="lucide:user-plus" />
                      }
                    >
                      Enroll {selectedStudents.size} Student
                      {selectedStudents.size > 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="teachers" title="Teachers">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assign Teachers</h2>

              <div className="space-y-4">
                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Available Teachers</h3>
                  <div className="space-y-2">
                    {mockTeachers
                      .filter((t) => !t.assigned)
                      .map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">
                              {teacher.email}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            color="primary"
                            variant={
                              selectedTeachers.has(teacher.id)
                                ? "solid"
                                : "bordered"
                            }
                            onPress={() => {
                              const newSelected = new Set(selectedTeachers);
                              if (newSelected.has(teacher.id)) {
                                newSelected.delete(teacher.id);
                              } else {
                                newSelected.add(teacher.id);
                              }
                              setSelectedTeachers(newSelected);
                            }}
                          >
                            {selectedTeachers.has(teacher.id)
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Assigned Teachers</h3>
                  <div className="space-y-2">
                    {mockTeachers
                      .filter((t) => t.assigned)
                      .map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">
                              {teacher.email}
                            </div>
                          </div>
                          <Chip size="sm" color="primary" variant="flat">
                            Assigned
                          </Chip>
                        </div>
                      ))}
                  </div>
                </div>

                {selectedTeachers.size > 0 && (
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="light"
                      onPress={() => setSelectedTeachers(new Set())}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      color="primary"
                      isLoading={loading}
                      onPress={handleAssignTeachers}
                      startContent={
                        !loading && <Icon icon="lucide:user-plus" />
                      }
                    >
                      Assign {selectedTeachers.size} Teacher
                      {selectedTeachers.size > 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
