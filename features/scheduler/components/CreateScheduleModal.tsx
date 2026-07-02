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
import { createSchedule, schedulerKeys } from "@/services/schedulerService";
import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/toast";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: {
    dayOfWeek?: number;
    startTime?: string;
    classId?: string;
    endTime?: string;
    location?: string;
    notes?: string;
    existingTeacherIds?: string[];
  } | null;
}

interface FormValues {
  classId: string;
  teacherIds: string[];
  dayOfWeek: string; // Form returns string usually
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

export function CreateScheduleModal({
  isOpen,
  onClose,
  defaultValues,
}: CreateScheduleModalProps) {
  const { classes, teachers } = useScheduler();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    defaultValues: {
      classId: "",
      teacherIds: [],
      dayOfWeek: "",
      startTime: "09:00",
      endTime: "10:30",
      location: "",
      notes: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Update form when defaultValues change
  useEffect(() => {
    if (isOpen && defaultValues) {
      if (defaultValues.classId) {
        setValue("classId", defaultValues.classId);
      }
      if (defaultValues.dayOfWeek !== undefined) {
        setValue("dayOfWeek", defaultValues.dayOfWeek.toString());
      }
      if (defaultValues.startTime) {
        setValue("startTime", defaultValues.startTime);
      }
      if (defaultValues.endTime) {
        setValue("endTime", defaultValues.endTime);
      } else if (defaultValues.startTime) {
        // Set end time to +90 mins by default IF not provided
        const [h, m] = defaultValues.startTime.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m + 90);
        const endH = date.getHours().toString().padStart(2, "0");
        const endM = date.getMinutes().toString().padStart(2, "0");
        setValue("endTime", `${endH}:${endM}`);
      }
      if (defaultValues.location) {
        setValue("location", defaultValues.location);
      }
      if (defaultValues.notes) {
        setValue("notes", defaultValues.notes);
      }
    }
  }, [isOpen, defaultValues, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await createSchedule({
        classId: data.classId,
        teacherIds: data.teacherIds,
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || undefined,
        notes: data.notes || undefined,
      });

      Toast({
        title: "Success",
        description: "Schedule created successfully",
        color: "success",
      });

      // Invalidate queries to refresh the calendar
      await queryClient.invalidateQueries({ queryKey: schedulerKeys.all });

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create schedule", error);
      Toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create schedule",
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Add New Schedule
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  name="classId"
                  label="Class"
                  placeholder="Select a class"
                  options={classes.map((cls) => ({
                    label: cls.name + " - " + cls.code,
                    value: cls.id,
                  }))}
                />

                <SelectInput
                  name="teacherIds"
                  label="Teachers"
                  placeholder="Select teachers..."
                  selectionMode="multiple"
                  options={teachers.map((teacher) => ({
                    label: teacher.name,
                    value: teacher.id,
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
                  <TimeInput
                    name="startTime"
                    label="Start Time"
                    required={true}
                  />
                  <TimeInput name="endTime" label="End Time" required={true} />
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
                Create Schedule
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
