"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Avatar,
  Spinner,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { formatDuration } from "../utils/timeUtils";
import { ClassSchedule } from "../types";
import { useClassEnrollments } from "@/services/classesService";
import { useGetIdentity } from "@/hooks/useGetIdentity";

interface ScheduleDetailModalProps {
  schedule: ClassSchedule | null;
  onClose: () => void;
}

export function ScheduleDetailModal({
  schedule,
  onClose,
}: ScheduleDetailModalProps) {
  const { user } = useGetIdentity();
  const { data: enrollmentsData, isLoading: isLoadingStudents } =
    useClassEnrollments({
      classId: schedule?.classId,
    });

  if (!schedule) return null;

  const isOpen = !!schedule;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const teachers = schedule.teachers || [
    {
      id: schedule.teacherId,
      name: schedule.teacherName,
      color: schedule.teacherColor,
    },
  ];

  const students = enrollmentsData?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent className="max-h-[85vh]">
        <ModalHeader className="flex flex-col gap-1 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Icon
              icon="lucide:calendar-check"
              className="w-5 h-5 text-primary"
            />
            <span>Schedule Details</span>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="space-y-6">
            {/* Header with Title & Teachers */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {schedule.className}
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="font-bold"
                  >
                    {schedule.location || "General"}
                  </Chip>
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Icon icon="lucide:clock" className="w-4 h-4" />
                  <span>
                    {days[schedule.dayOfWeek]}, {schedule.startTime} -{" "}
                    {schedule.endTime} (
                    {formatDuration(schedule.startTime, schedule.endTime)})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                  Teaching Team
                </p>
                <div className="flex flex-wrap gap-2">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 pl-1 pr-3 py-1 rounded-full border border-primary/20"
                    >
                      <Avatar
                        src={teacher.avatar}
                        name={teacher.name.charAt(0)}
                        size="sm"
                        className="w-7 h-7 text-[10px]"
                        style={{
                          backgroundColor: teacher.color + "40",
                          border: `2px solid ${teacher.color}`,
                        }}
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {teacher.name}
                      </span>
                      {teacher.id === user?.id && (
                        <Chip
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="h-5 text-[10px] px-1 font-bold"
                        >
                          You
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Divider className="opacity-50" />

            {/* Students Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                  Enrolled Students ({students.length})
                </p>
              </div>

              {isLoadingStudents ? (
                <div className="flex justify-center py-8">
                  <Spinner size="sm" label="Fetching students..." />
                </div>
              ) : students.length > 0 ? (
                <ScrollShadow className="max-h-[200px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {students.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-primary/20 transition-all cursor-default group text-left"
                      >
                        <Avatar
                          name={enrollment.studentName?.charAt(0) || "S"}
                          size="sm"
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate pr-2">
                            {enrollment.studentName}
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase font-medium">
                            Active Member
                          </p>
                        </div>
                        <Icon
                          icon="lucide:check-circle-2"
                          className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <Icon
                    icon="lucide:users-2"
                    className="w-8 h-8 text-gray-300 mb-2"
                  />
                  <p className="text-sm font-bold text-gray-400">
                    No students enrolled yet
                  </p>
                </div>
              )}
            </div>

            {/* Meta information */}
            <div className="flex flex-wrap gap-2 pt-2">
              {schedule.hasAttendance && (
                <Chip
                  startContent={<Icon icon="lucide:clipboard-list" />}
                  size="sm"
                  color="success"
                  variant="flat"
                  className="font-bold"
                >
                  Attendance Record Required
                </Chip>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <Button
            color="primary"
            variant="flat"
            className="font-bold px-8"
            onPress={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
