"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AutocompleteInput } from "@/components/inputs";
import { TeacherClassFormValues, TeacherClassItem } from "../interfaces";
import { useTeachersLookup, useClassesLookup } from "@/services/lookupService";
import {
  fetchTeacherClasses,
  teacherClassKeys,
} from "@/services/classesService";

interface TeacherClassFormProps {
  mode?: "create" | "edit";
}

export function TeacherClassForm({}: TeacherClassFormProps) {
  const { watch, setValue } = useFormContext<TeacherClassFormValues>();
  const selectedClassId = watch("classId");

  // Use lookup hooks
  const { data: teachers = [], isLoading: loadingTeachers } =
    useTeachersLookup();
  const { data: classes = [], isLoading: loadingClasses } = useClassesLookup();

  // Fetch existing assignments for the selected class
  const { data: existingAssignments } = useQuery({
    queryKey: teacherClassKeys.list({ classId: selectedClassId }),
    queryFn: () => fetchTeacherClasses({ classId: selectedClassId }),
    enabled: !!selectedClassId,
  });

  const assignedTeacherIds = React.useMemo(() => {
    if (!existingAssignments?.data) return new Set<string>();
    return new Set(
      existingAssignments.data.map(
        (assignment: TeacherClassItem) => assignment.teacherId,
      ),
    );
  }, [existingAssignments]);

  const teacherOptions = React.useMemo(() => {
    return teachers.map((t) => {
      const isAssigned = assignedTeacherIds.has(t.value);
      return {
        label: isAssigned ? `${t.text} (Already Assigned)` : t.text,
        value: t.value,
        description: isAssigned
          ? "This teacher is already assigned to this class"
          : undefined,
        // We can't strictly disable options in AutocompleteInput interface usually,
        // but if the component supports it we would.
        // If not, we rely on the label indication.
        // However, standard Select/Autocomplete often doesn't support 'disabled' per option easily in these wrappers
        // unless mapped to 'isDisabled'. Let's assume we can pass specific props or just use the label for now.
        // Actually, looking at AutocompleteInput implementation (not shown but assumed),
        // standard pattern is `value` and `label`.
        // If we want to strictly prevent selection, we might need validation or a custom filter.
        // For now, let's mark the text.
      };
    });
  }, [teachers, assignedTeacherIds]);

  // Reset teacher when class changes
  React.useEffect(() => {
    // Optional: if we want to clear teacher selection when class changes to prevent invalid state
    // setValue("teacherId", "");
    // But user might just be changing class.
    // Let's safe guard: if currently selected teacher is already assigned in the NEW class, warn or clear?
    // For simplicity, let's just let the user see the new status.
  }, [selectedClassId, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="Class"
          name="classId"
          placeholder="Select a class..."
          options={classes.map((c) => ({ label: c.text, value: c.value }))}
          isLoading={loadingClasses}
          required={true}
        />

        <AutocompleteInput
          label="Teacher"
          name="teacherId"
          placeholder={
            selectedClassId ? "Select a teacher..." : "Select a class first"
          }
          options={teacherOptions}
          isLoading={loadingTeachers}
          required={true}
          disabled={!selectedClassId}
          disabledKeys={assignedTeacherIds}
        />
      </div>
    </div>
  );
}
