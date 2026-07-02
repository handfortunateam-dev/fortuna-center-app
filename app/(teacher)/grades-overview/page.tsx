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
  Tabs,
  Tab,
  Skeleton,
} from "@heroui/react";

// Types
interface TeacherClass {
  id: string;
  name: string;
  code: string;
  description: string | null;
  students: number;
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
  class: TeacherClass;
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
}

export default function TeacherGradesPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Fetch Teacher's Classes
  const { data: classesData, isLoading: classesLoading } = useQuery<
    TeacherClass[]
  >({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const { data } = await apiClient.get("/teacher/classes");
      return data;
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
    queryKey: ["teacher-grades", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) throw new Error("No class selected");
      const { data } = await apiClient.get(
        `/teacher/grades?classId=${selectedClassId}`,
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
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 rounded-lg mb-2" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="flex gap-6 border-b border-divider pb-0">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-32 rounded-t-lg" />
          ))}
        </div>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody className="text-center space-y-2">
                  <Skeleton className="h-4 w-24 mx-auto rounded-lg" />
                  <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card>
            <CardBody className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-2 border-b border-divider last:border-0"
                >
                  <div className="flex items-center gap-3 w-1/4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-3 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-1/2 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!classesData || classesData.length === 0) {
    return (
      <div className="space-y-6">
        <Heading>My Class Grades</Heading>
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-gray-500">
              You don&apos;t have any classes assigned yet. Please contact
              admin.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading>My Class Grades</Heading>
        <p className="text-gray-500 text-sm mt-1">
          View and track student grades for your classes.
        </p>
      </div>

      <Tabs
        aria-label="Your Classes"
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
                <Chip size="sm" variant="dot" color="primary">
                  {cls.students} students
                </Chip>
              </div>
            }
          />
        ))}
      </Tabs>

      {gradesLoading && (
        <div className="space-y-4 animate-appearance-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody className="text-center space-y-2">
                  <Skeleton className="h-4 w-24 mx-auto rounded-lg" />
                  <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card>
            <CardBody className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-2 border-b border-divider last:border-0"
                  >
                    <div className="flex items-center gap-3 w-1/4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex flex-col gap-2 w-full">
                        <Skeleton className="h-3 w-3/4 rounded-lg" />
                        <Skeleton className="h-3 w-1/2 rounded-lg" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-12 rounded-lg" />
                    <Skeleton className="h-8 w-12 rounded-lg" />
                    <Skeleton className="h-8 w-12 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
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
                <TableBody emptyContent="No students enrolled or no assignments created yet.">
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
