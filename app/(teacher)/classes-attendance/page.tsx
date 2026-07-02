"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { getTeacherClasses } from "@/services/attendanceService";

export default function TeacherClassesAttendancePage() {
  const router = useRouter();

  const { data: classes, isLoading } = useQuery({
    queryKey: ["teacher-classes-attendance"],
    queryFn: getTeacherClasses,
  });

  const handleClassClick = (classId: string) => {
    router.push(`/classes-attendance/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h1" size="3xl" weight="bold">
          Class Attendance
        </Heading>
        <Text color="muted">
          View attendance records for all your classes. Click on a class to see
          detailed attendance data.
        </Text>
      </div>

      {!classes || classes.length === 0 ? (
        <Card className="border border-default-200">
          <CardBody className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Icon
                icon="lucide:clipboard-list"
                className="w-16 h-16 text-default-300"
              />
              <div className="text-center">
                <Heading as="h3" size="lg" className="mb-2">
                  No Classes Found
                </Heading>
                <Text color="muted">
                  You are not currently assigned to any classes.
                </Text>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem) => {
            const attendanceProgress =
              classItem.totalSessions > 0
                ? Math.round(
                    (classItem.completedSessions / classItem.totalSessions) *
                      100,
                  )
                : 0;

            return (
              <Card
                key={classItem.id}
                isPressable
                onPress={() => handleClassClick(classItem.id)}
                className="border border-default-200 hover:border-primary hover:shadow-md transition-all"
              >
                <CardBody className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip size="sm" variant="flat" color="secondary">
                          {classItem.code}
                        </Chip>
                        {classItem.isActive && (
                          <Chip size="sm" variant="dot" color="success">
                            Active
                          </Chip>
                        )}
                      </div>
                      <Heading as="h3" size="lg" weight="bold" className="mb-1">
                        {classItem.name}
                      </Heading>
                      {classItem.description && (
                        <Text className="text-sm text-default-500 line-clamp-2">
                          {classItem.description}
                        </Text>
                      )}
                    </div>
                    <Icon
                      icon="lucide:clipboard-check"
                      className="w-8 h-8 text-primary opacity-50"
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-primary-50 p-3 rounded-lg text-center">
                      <div className="text-primary font-bold text-xl">
                        {classItem.enrollmentCount}
                      </div>
                      <div className="text-xs text-default-600 mt-1">
                        Students
                      </div>
                    </div>
                    <div className="bg-secondary-50 p-3 rounded-lg text-center">
                      <div className="text-secondary font-bold text-xl">
                        {classItem.totalSessions}
                      </div>
                      <div className="text-xs text-default-600 mt-1">
                        Sessions
                      </div>
                    </div>
                    <div
                      className={`${attendanceProgress >= 50 ? "bg-success-50" : "bg-warning-50"} p-3 rounded-lg text-center`}
                    >
                      <div
                        className={`${attendanceProgress >= 50 ? "text-success" : "text-warning"} font-bold text-xl`}
                      >
                        {classItem.completedSessions}
                      </div>
                      <div className="text-xs text-default-600 mt-1">
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="pt-2 border-t border-default-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-default-500">Session Progress</span>
                      <span className="font-semibold">
                        {attendanceProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-default-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${attendanceProgress >= 50 ? "bg-success" : "bg-warning"}`}
                        style={{ width: `${attendanceProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action indicator */}
                  <div className="flex items-center justify-end text-primary text-sm font-medium">
                    <span>View Attendance</span>
                    <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
