"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heading } from "@/components/heading";
import { apiClient } from "@/lib/axios";
import {
  Card,
  CardBody,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";

// Types
interface ClassData {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  dueDate: string | null;
}

interface Student {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number | null;
  status: "pending" | "submitted" | "graded" | "late";
}

interface GradesData {
  class: ClassData;
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
}

export default function AdminGradesPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Fetch All Classes
  const { data: classesData, isLoading: classesLoading } = useQuery<
    ClassData[]
  >({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await apiClient.get("/classes");
      return data.data;
    },
  });

  // Auto-select first class when data loads
  React.useEffect(() => {
    if (classesData && classesData.length > 0 && !selectedClassId) {
      setSelectedClassId(classesData[0].id);
    }
  }, [classesData, selectedClassId]);

  // Fetch Grades for selected class
  const { data: gradesData, isLoading: gradesLoading } = useQuery<GradesData>({
    queryKey: ["grades", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) throw new Error("No class selected");
      const { data } = await apiClient.get(
        `/grades?classId=${selectedClassId}`,
      );
      return data.data;
    },
    enabled: !!selectedClassId,
  });

  const assignments = gradesData?.assignments || [];
  const students = gradesData?.students || [];
  const submissions = gradesData?.submissions || [];

  // Helper to get submission
  const getSubmission = (
    studentId: string,
    assignmentId: string,
  ): Submission | undefined => {
    return submissions.find(
      (s) => s.studentId === studentId && s.assignmentId === assignmentId,
    );
  };

  if (classesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="Loading classes..." />
      </div>
    );
  }

  if (!classesData || classesData.length === 0) {
    return (
      <div className="space-y-6">
        <Heading>Grades Management</Heading>
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-gray-500">
              No classes found. Please create a class first.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading>Grades Management</Heading>
        <p className="text-gray-500 text-sm mt-1">
          View and analyze student grades across all classes.
        </p>
      </div>

      <Tabs
        aria-label="Classes"
        selectedKey={selectedClassId}
        onSelectionChange={(key) => setSelectedClassId(key as string)}
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-4 h-12",
        }}
      >
        {classesData.map((cls) => (
          <Tab
            key={cls.id}
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold">{cls.name}</span>
                <Chip size="sm" variant="flat">
                  {cls.code}
                </Chip>
              </div>
            }
          />
        ))}
      </Tabs>

      {gradesLoading && (
        <div className="flex justify-center p-10">
          <Spinner size="lg" label="Loading grades..." />
        </div>
      )}

      {selectedClassId && !gradesLoading && gradesData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-primary">
                  {students.length}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-gray-500">Total Assignments</p>
                <p className="text-3xl font-bold text-secondary">
                  {assignments.length}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <p className="text-sm text-gray-500">Total Submissions</p>
                <p className="text-3xl font-bold text-success">
                  {submissions.length}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="overflow-x-auto p-0">
              <Table aria-label="Grades Table" removeWrapper>
                <TableHeader>
                  <TableColumn>STUDENT</TableColumn>
                  {assignments.map((a) => (
                    <TableColumn key={a.id} align="center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-small">
                          {a.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          Max: {a.maxScore}
                        </span>
                      </div>
                    </TableColumn>
                  ))}
                  <TableColumn align="center">TOTAL</TableColumn>
                  <TableColumn align="center">AVERAGE</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No students enrolled or no assignments created.">
                  {students.map((student) => {
                    let totalScore = 0;
                    let maxTotal = 0;
                    let gradedCount = 0;

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <User
                            name={student.name}
                            description={student.email}
                            avatarProps={{ src: student.image || undefined }}
                          />
                        </TableCell>
                        {assignments.map((a) => {
                          const sub = getSubmission(student.id, a.id);
                          const score = sub?.score;

                          if (score !== undefined && score !== null) {
                            totalScore += Number(score);
                            gradedCount++;
                          }
                          maxTotal += Number(a.maxScore);

                          return (
                            <TableCell key={a.id}>
                              {sub ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={`font-bold ${
                                      score === null
                                        ? "text-gray-400"
                                        : score < 60
                                          ? "text-danger"
                                          : score < 75
                                            ? "text-warning"
                                            : "text-success"
                                    }`}
                                  >
                                    {score ?? "-"}
                                  </span>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={
                                      sub.status === "graded"
                                        ? "success"
                                        : sub.status === "submitted"
                                          ? "primary"
                                          : "warning"
                                    }
                                    className="text-[10px] h-5 min-h-0 px-1"
                                  >
                                    {sub.status}
                                  </Chip>
                                </div>
                              ) : (
                                <div className="flex justify-center text-gray-300">
                                  -
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <div className="flex flex-col items-center font-bold">
                            <span className="text-lg">{totalScore}</span>
                            <span className="text-gray-400 text-xs">
                              / {maxTotal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip
                              color={
                                gradedCount === 0
                                  ? "default"
                                  : (totalScore / maxTotal) * 100 >= 75
                                    ? "success"
                                    : (totalScore / maxTotal) * 100 >= 60
                                      ? "warning"
                                      : "danger"
                              }
                              variant="flat"
                              size="lg"
                            >
                              {gradedCount === 0
                                ? "N/A"
                                : `${((totalScore / maxTotal) * 100).toFixed(1)}%`}
                            </Chip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
