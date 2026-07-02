"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { FormTable, FormTableColumn } from "@/components/table/FormTable";
import {
  EDUCATION_LEVELS,
  OCCUPATION_TYPES,
} from "@/features/lms/students/constants";
import { Heading } from "@/components/heading";

interface StudentData extends Record<string, unknown> {
  id: string;
  studentId: string;
  registrationDate: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  education: string | null;
  occupation: string | null;
  status: string;
}

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i,
).map((y) => ({ label: String(y), value: String(y) }));

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "On Leave", value: "on_leave" },
];

export default function BulkUpdateStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [filterParams, setFilterParams] = useState({
    year: "",
    status: "",
  });

  const { isFetching, refetch } = useQuery({
    queryKey: ["students-bulk", filterParams],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.set("limit", "100");
      if (filterParams.year) query.set("year", filterParams.year);
      if (filterParams.status) query.set("status", filterParams.status);

      const res = await fetch(`/api/students?${query.toString()}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch data");
      }

      setStudents(result.data || []);
      return result.data || [];
    },
    enabled: false,
  });

  const loadData = () => {
    refetch().then((queryResult) => {
      if (queryResult.data) {
        Toast({
          title: "Success",
          description: `Loaded ${queryResult.data.length} students`,
          color: "success",
        });
      } else if (queryResult.error) {
        const error = queryResult.error as Error;
        Toast({ title: "Error", description: error.message, color: "danger" });
      }
    });
  };

  const handleDataChange = (newData: StudentData[]) => {
    setStudents(newData);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<StudentData>[]) => {
      const res = await fetch(`/api/students/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update bulk data");
      }

      return result;
    },
    onSuccess: (result) => {
      Toast({
        title: "Success",
        description: result.message,
        color: "success",
      });
    },
    onError: (error: Error) => {
      Toast({ title: "Error", description: error.message, color: "danger" });
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  const handleSaveAll = () => {
    setSaving(true);

    const payload = students.map((stu) => ({
      id: stu.id,
      education: stu.education || "",
      occupation: stu.occupation || "",
    }));

    saveMutation.mutate(payload);
  };

  const columns: FormTableColumn[] = useMemo(
    () => [
      {
        key: "studentId",
        label: "ID / No Induk",
        type: "text",
        minWidth: 160,
      },
      {
        key: "registrationDate",
        label: "Registration Date",
        type: "date",
        minWidth: 180,
      },
      {
        key: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        minWidth: 160,
      },
      {
        key: "middleName",
        label: "Middle Name",
        type: "text",
        required: false,
        minWidth: 150,
      },
      {
        key: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        minWidth: 160,
      },
      {
        key: "nickname",
        label: "Nickname",
        type: "text",
        minWidth: 160,
      },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        minWidth: 140,
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ],
      },
      {
        key: "placeOfBirth",
        label: "Place of Birth",
        type: "text",
        minWidth: 180,
      },
      {
        key: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        minWidth: 200,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: false,
        minWidth: 220,
      },
      {
        key: "phone",
        label: "Phone",
        type: "text",
        required: true,
        minWidth: 160,
      },
      {
        key: "address",
        label: "Address",
        type: "text",
        minWidth: 260,
      },
      {
        key: "education",
        label: "Education",
        type: "select",
        minWidth: 200,
        options: EDUCATION_LEVELS,
      },
      {
        key: "occupation",
        label: "Occupation",
        type: "select",
        minWidth: 200,
        options: OCCUPATION_TYPES,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        minWidth: 140,
        options: STATUS_OPTIONS,
      },
    ],
    [],
  );

  const tableData = useMemo(() => {
    return students;
  }, [students]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => router.back()}>
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </Button>
          <Heading size="xl" weight="bold" className="tracking-tight">
            Bulk Update Students
          </Heading>
        </div>

        {students.length > 0 && (
          <Button
            color="primary"
            startContent={<Icon icon="lucide:save" />}
            onPress={handleSaveAll}
            isLoading={saving}
          >
            Save Changes
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex gap-3 pt-6 px-6 flex-wrap items-end">
          <Autocomplete
            labelPlacement="outside-top"
            label="Filter by Joined Year"
            placeholder="Select Year"
            selectedKey={filterParams.year || null}
            onSelectionChange={(key) => {
              setFilterParams((prev) => ({
                ...prev,
                year: (key as string) || "",
              }));
            }}
            size="md"
            className="w-48"
          >
            {YEARS.map((y) => (
              <AutocompleteItem key={y.value}>{y.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete
            label="Filter by Status"
            labelPlacement="outside-top"
            placeholder="Select Status"
            selectedKey={filterParams.status || null}
            onSelectionChange={(key) => {
              setFilterParams((prev) => ({
                ...prev,
                status: (key as string) || "",
              }));
            }}
            size="md"
            className="w-48"
          >
            {STATUS_OPTIONS.map((s) => (
              <AutocompleteItem key={s.value}>{s.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Button
            startContent={<Icon icon="lucide:search" />}
            color="secondary"
            onPress={loadData}
            isLoading={isFetching}
          >
            Load Students
          </Button>

          <Button
            startContent={<Icon icon="lucide:x" />}
            variant="flat"
            onPress={() => {
              setFilterParams({ year: "", status: "" });
              setStudents([]);
            }}
          >
            Clear Filters
          </Button>
        </CardHeader>

        <CardBody className="px-6 pb-6 pt-4">
          {students.length > 0 ? (
            <FormTable
              columns={columns}
              data={tableData}
              onChange={handleDataChange}
              keyField="id"
              enableDelete={false}
              enableAdd={false}
              showPagination={true}
              pageSize={10}
              enableUnsavedChangesWarning={true}
            />
          ) : (
            <div className="text-center text-default-500 min-h-[200px] flex items-center justify-center">
              {isFetching
                ? "Loading..."
                : "Use filters and load students to preview data."}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
