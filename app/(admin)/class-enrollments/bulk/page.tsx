"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm, Controller, useWatch } from "react-hook-form";

import CardWrapper from "@/components/wrappers/card-wrappers";
import { FormTable, FormTableColumn } from "@/components/table/FormTable";
import { useClasses } from "@/services/classesService";
import { useStudents } from "@/services/studentsService";
import { Toast } from "@/components/toast";
import { apiClient } from "@/lib/axios";
import { ClassItem } from "@/features/lms/classes/interfaces";
import { IStudent } from "@/features/lms/students/interface";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface EnrollmentFormValues {
  classId: string;
  enrollments: Array<{ key: string; studentId: string }>;
}

export default function BulkClassEnrollmentPage() {
  const router = useRouter();

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EnrollmentFormValues>({
    defaultValues: {
      classId: "",
      enrollments: [{ key: "1", studentId: "" }],
    },
  });

  // Watches for reactive changes
  // Watches for reactive changes - using watch directly can be more reliable for top-level props
  // but if the user wants useWatch specifically, let's use it with proper defaults.
  const classId = useWatch({ control, name: "classId", defaultValue: "" });
  const enrollments = useWatch({
    control,
    name: "enrollments",
    defaultValue: [{ key: "1", studentId: "" }],
  });

  // Fetch data
  const { data: classesData, isLoading: isLoadingClasses } = useClasses({
    isActive: true,
    limit: 100,
  });
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    limit: 1000,
  });

  // Options for class selector
  const classOptions = useMemo(
    () =>
      (classesData?.data || []).map((c: ClassItem) => ({
        value: c.id,
        label: `${c.name} (${c.code}) - ${c.level || "No Level"}`,
      })),
    [classesData],
  );

  // Master list of all available student options - ONLY show those NOT already enrolled
  const allStudentOptions = useMemo(
    () =>
      (studentsData?.data || [])
        .filter((s: IStudent) => !s.isEnrolled) // Filter by enrollment status provided by API
        .map((s: IStudent) => ({
          value: s.id,
          label: `${s.firstName} ${s.lastName} (${s.studentId})`,
        })),
    [studentsData],
  );

  const columns: FormTableColumn[] = useMemo(
    () => [
      {
        key: "studentId",
        label: "Select Student",
        type: "autocomplete",
        // Use dynamic options to filter out students selected in OTHER rows
        options: (_row: unknown, index: number) => {
          const currentEnrollments = (enrollments || []) as Array<{
            key: string;
            studentId: string;
          }>;
          const selectedIds = currentEnrollments
            .filter((_, i) => i !== index)
            .map((e) => e.studentId);
          return allStudentOptions.filter(
            (opt) => !selectedIds.includes(opt.value),
          );
        },
        placeholder: "Type student name...",
        required: true,
        minWidth: 400,
      },
    ],
    [allStudentOptions, enrollments, classId],
  );

  const onSubmit = async (data: EnrollmentFormValues) => {
    const studentIds = data.enrollments
      .map((row) => row.studentId)
      .filter((id) => id !== "");

    if (studentIds.length === 0) {
      Toast({
        title: "Warning",
        description: "Select at least one student",
        color: "warning",
      });
      return;
    }

    try {
      await apiClient.post("/class-enrollments/bulk", {
        classId: data.classId,
        studentIds,
      });

      Toast({
        title: "Success",
        description: `${studentIds.length} students successfully enrolled in class`,
        color: "success",
      });
      router.push("/class-enrollments");
    } catch (error: unknown) {
      Toast({
        title: "Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while saving enrollment",
        color: "danger",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <LoadingScreen isLoading={isLoadingClasses || isLoadingStudents} />
      <div className="flex items-center gap-4 mb-2">
        <Button
          isIconOnly
          variant="flat"
          radius="full"
          onPress={() => router.push("/class-enrollments")}
        >
          <Icon className="w-5 h-5" icon="solar:arrow-left-outline" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Student Enrollment</h1>
          <p className="text-default-500 font-medium">
            Enroll multiple students into a single class at once.
          </p>
        </div>
      </div>

      <form
        className="grid grid-cols-1 gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <CardWrapper title="1. Select Target Class">
          <div className="max-w-md">
            <Controller
              control={control}
              name="classId"
              rules={{ required: "Class is required" }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  errorMessage={error?.message}
                  isInvalid={!!error}
                  isRequired
                  label="Class"
                  placeholder={isLoadingClasses ? "Loading..." : "Select Class"}
                  selectedKeys={
                    field.value ? new Set([String(field.value)]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    field.onChange(val);
                  }}
                >
                  {classOptions.map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </CardWrapper>

        <CardWrapper title="2. Student List">
          <div className="space-y-4">
            {isLoadingStudents && (
              <div className="flex items-center gap-2 p-3 bg-default-100 rounded-xl mb-4">
                <Icon
                  className="w-5 h-5 animate-spin text-primary"
                  icon="lucide:loader-2"
                />
                <span className="text-sm text-default-600">
                  Loading student data...
                </span>
              </div>
            )}

            {!classId && !isLoadingStudents && (
              <div className="p-4 mb-4 bg-primary/10 text-primary rounded-xl flex items-center gap-3 text-sm font-medium border border-primary/20">
                <Icon className="w-5 h-5" icon="solar:info-circle-bold" />
                <span>
                  Select a target class first to enable enrollment input.
                </span>
              </div>
            )}

            <FormTable
              key={classId || "none"}
              columns={columns}
              data={enrollments}
              emptyRowTemplate={{ studentId: "", key: "" }}
              enableAdd={true}
              enableDelete={true}
              isDisabled={!classId}
              // pageSize={}
              title="Enrollment data input"
              onChange={(newData) => setValue("enrollments", newData as never)}
            />

            <div className="flex justify-end pt-4 border-t border-divider">
              <Button
                color="primary"
                isDisabled={!classId || isSubmitting}
                isLoading={isSubmitting}
                size="lg"
                startContent={
                  !isSubmitting && (
                    <Icon className="w-5 h-5" icon="solar:diskette-bold" />
                  )
                }
                type="submit"
              >
                Save Enrollment
              </Button>
            </div>
          </div>
        </CardWrapper>
      </form>
    </div>
  );
}
