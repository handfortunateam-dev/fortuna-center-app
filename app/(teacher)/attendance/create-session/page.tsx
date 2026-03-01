"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import {
  getTeacherClasses,
  getClassSchedules,
  createSession,
} from "@/services/attendanceService";
import {
  AutocompleteInput,
  SelectInput,
  DatePickerInput,
  TextareaInput,
} from "@/components/inputs";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Toast } from "@/components/toast";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface FormValues {
  classId: string;
  scheduleId: string;
  date: string;
  notes: string;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    defaultValues: {
      classId: "",
      scheduleId: "",
      date: "",
      notes: "",
    },
  });

  const { watch, setValue, handleSubmit: handleFormSubmit } = methods;

  const selectedClassId = watch("classId");
  const selectedScheduleId = watch("scheduleId");
  const selectedDate = watch("date");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const notes = watch("notes");

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: getTeacherClasses,
  });

  const classOptions = useMemo(() => {
    return (
      classes?.map((cls) => ({
        label: `${cls.code} - ${cls.name}`,
        value: cls.id,
      })) || []
    );
  }, [classes]);

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ["class-schedules", selectedClassId],
    queryFn: () => getClassSchedules(selectedClassId),
    enabled: !!selectedClassId,
  });

  const scheduleOptions = useMemo(() => {
    if (!schedules) return [];
    return schedules.map((schedule) => ({
      label: `${DAYS[schedule.dayOfWeek]} • ${schedule.startTime} - ${
        schedule.endTime
      }${schedule.room ? ` • ${schedule.room}` : ""}`,
      value: schedule.id,
    }));
  }, [schedules]);

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-sessions"],
      });
      Toast({
        title: "Session created successfully! Redirecting...",
        color: "success",
      });

      router.push(`/attendance/${data.session.id}`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to create session";
      Toast({
        title: "Error",
        description: message,
        color: "danger",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({
      scheduleId: data.scheduleId,
      date: data.date,
      notes: data.notes || undefined,
    });
  };

  const selectedClass = classes?.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button isIconOnly variant="light" onPress={() => router.back()}>
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <Heading as="h1" size="2xl" weight="bold">
            Create New Session
          </Heading>
          <Text color="muted">
            Create a new class session (for makeup class, extra session, etc.)
          </Text>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border border-primary-200 bg-primary-50">
        <CardBody className="p-4">
          <div className="flex gap-3">
            <Icon
              icon="lucide:info"
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-primary-700">
              <p className="font-semibold mb-1">When to use this feature:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Makeup class for missed session</li>
                <li>Extra session for additional topics</li>
                <li>Replacement session for cancelled class</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Form */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <FormProvider {...methods}>
            <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
              {/* Select Class */}
              <AutocompleteInput
                label="Select Class"
                name="classId"
                placeholder="Choose a class"
                options={classOptions}
                isLoading={loadingClasses}
                onChange={() => {
                  setValue("scheduleId", "");
                  setValue("date", "");
                }}
              />

              {/* Select Schedule */}
              {selectedClassId && (
                <div>
                  {loadingSchedules ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <Text>Loading schedules...</Text>
                    </div>
                  ) : schedules && schedules.length > 0 ? (
                    <SelectInput
                      label="Select Schedule/Time"
                      name="scheduleId"
                      placeholder="Choose a time slot"
                      options={scheduleOptions}
                      required
                    />
                  ) : (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                      <Text className="text-warning-700 text-sm">
                        ⚠️ No schedules found for this class. Please contact
                        admin.
                      </Text>
                    </div>
                  )}
                </div>
              )}

              {/* Select Date */}
              {selectedScheduleId && (
                <DatePickerInput
                  label="Session Date"
                  name="date"
                  minValue={today(getLocalTimeZone())}
                  required
                />
              )}

              {/* Notes */}
              {selectedDate && (
                <TextareaInput
                  label="Notes (Optional)"
                  name="notes"
                  placeholder="e.g., Makeup class for Feb 3rd, Extra session for exam preparation"
                  minRows={3}
                  required={false}
                />
              )}

              {/* Preview */}
              {selectedClass && selectedScheduleId && selectedDate && (
                <Card className="bg-default-50 border border-default-200">
                  <CardBody className="p-4">
                    <Text weight="semibold" className="mb-3">
                      Session Preview:
                    </Text>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="lucide:book"
                          className="w-4 h-4 text-default-500"
                        />
                        <span>
                          <strong>Class:</strong> {selectedClass.code} -{" "}
                          {selectedClass.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="lucide:calendar"
                          className="w-4 h-4 text-default-500"
                        />
                        <span>
                          <strong>Date:</strong>{" "}
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="lucide:clock"
                          className="w-4 h-4 text-default-500"
                        />
                        <span>
                          <strong>Time:</strong>{" "}
                          {
                            schedules?.find((s) => s.id === selectedScheduleId)
                              ?.startTime
                          }{" "}
                          -{" "}
                          {
                            schedules?.find((s) => s.id === selectedScheduleId)
                              ?.endTime
                          }
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Error Display */}
              {createMutation.isError && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:alert-circle"
                      className="w-5 h-5 text-danger"
                    />
                    <Text className="text-danger-700">
                      {createMutation.error instanceof Error
                        ? createMutation.error.message
                        : "Failed to create session"}
                    </Text>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="light" onPress={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:plus-circle" />}
                  isLoading={createMutation.isPending}
                  isDisabled={!selectedScheduleId || !selectedDate}
                >
                  Create Session
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    </div>
  );
}
