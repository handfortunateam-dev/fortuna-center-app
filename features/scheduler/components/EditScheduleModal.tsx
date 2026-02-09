"use client";

import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useForm, FormProvider } from "react-hook-form";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { TimeInput } from "@/components/inputs/TimeInput";
import { useScheduler } from "../context/SchedulerContext";
import { updateSchedule as apiUpdateSchedule, schedulerKeys } from "@/services/schedulerService";
import { useQueryClient } from "@tanstack/react-query";
import { ClassSchedule, ClassRoom, Teacher } from "../types";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ClassSchedule | null;
}

interface FormValues {
  classId: string;
  teacherIds: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function EditScheduleModal({
  isOpen,
  onClose,
  schedule,
}: EditScheduleModalProps) {
  const { classes, teachers } = useScheduler();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>();
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form values when schedule changes
  useEffect(() => {
    if (isOpen && schedule) {
      const selectedTeachers = (schedule.teachers || []).map((t) => t.id);
      reset({
        classId: schedule.classId || "",
        teacherIds:
          selectedTeachers.length > 0 ? selectedTeachers : [schedule.teacherId],
        dayOfWeek: schedule.dayOfWeek?.toString() || "",
        startTime: schedule.startTime || "09:00",
        endTime: schedule.endTime || "10:30",
        location: schedule.location || "",
        notes: schedule.notes || "",
      });
    }
  }, [isOpen, schedule, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!schedule) return;

    try {
      await apiUpdateSchedule(schedule.id, {
        classId: data.classId,
        teacherIds: data.teacherIds,
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || undefined,
        notes: data.notes || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: schedulerKeys.all });

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to update schedule", error);
    }
  };

  if (!schedule) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Edit Schedule
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  name="classId"
                  label="Class"
                  placeholder="Select a class"
                  options={classes.map((cls: ClassRoom) => ({
                    label: cls.name,
                    value: cls.id,
                  }))}
                />

                <SelectInput
                  name="teacherIds"
                  label="Teachers"
                  placeholder="Select teachers"
                  selectionMode="multiple"
                  options={teachers.map((t: Teacher) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                />

                <AutocompleteInput
                  name="dayOfWeek"
                  label="Day of Week"
                  placeholder="Select a day"
                  options={DAYS_OF_WEEK.map((day) => ({
                    label: day.label,
                    value: day.value,
                  }))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <TimeInput name="startTime" label="Start Time" />
                  <TimeInput name="endTime" label="End Time" />
                </div>

                <div className="md:col-span-2">
                  <TextInput
                    name="location"
                    label="Location"
                    placeholder="e.g. Room 101"
                    required={false}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextareaInput
                    name="notes"
                    label="Notes"
                    placeholder="Additional notes..."
                    required={false}
                    minRows={3}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
