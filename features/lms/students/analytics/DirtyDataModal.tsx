"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FormTable, FormTableColumn } from "@/components/table/FormTable";
import { Toast } from "@/components/toast";
import {
  EDUCATION_LEVELS,
  OCCUPATION_TYPES,
} from "@/features/lms/students/constants";
import { StudentData } from "./types";

interface DirtyDataModalProps {
  field: "education" | "occupation" | "ages";
  value: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function DirtyDataModal({
  field,
  value,
  isOpen,
  onClose,
  onSaved,
}: DirtyDataModalProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const columns: FormTableColumn[] = useMemo(
    () => [
      { key: "studentId", label: "STUDENT ID", editable: false, minWidth: 150 },
      { key: "fullName", label: "NAME", editable: false, minWidth: 200 },
      {
        key: "education",
        label: "EDUCATION",
        type: "select",
        options: [...EDUCATION_LEVELS],
        minWidth: 200,
      },
      {
        key: "occupation",
        label: "OCCUPATION",
        type: "select",
        options: [...OCCUPATION_TYPES],
        minWidth: 200,
      },
    ],
    [],
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (field === "ages") {
          query.set("ageRange", value);
        } else {
          query.set(field, value);
        }
        query.set("limit", "1000");

        const res = await fetch(`/api/students?${query.toString()}`);
        const json = await res.json();
        if (json.success) {
          const mappedData = (json.data || []).map((stu: StudentData) => ({
            ...stu,
            fullName:
              `${stu.firstName} ${(stu as Record<string, unknown>).middleName || ""} ${stu.lastName}`.trim(),
            education: stu.education || "Unknown/Missing",
            occupation: stu.occupation || "Unknown/Missing",
          }));
          setStudents(mappedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && field && value) {
      fetchStudents();
    }
  }, [isOpen, field, value]);

  const saveUpdates = async () => {
    try {
      setSaving(true);
      const payload = students.map((stu) => ({
        id: stu.id,
        education: stu.education === "Unknown/Missing" ? null : stu.education,
        occupation:
          stu.occupation === "Unknown/Missing" ? null : stu.occupation,
      }));

      const res = await fetch(`/api/students/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload }),
      });

      const json = await res.json();
      if (json.success) {
        Toast({
          title: "Success",
          description: "Data fixed successfully!",
          color: "success",
        });
        onSaved();
        onClose();
      } else {
        throw new Error(json.message);
      }
    } catch (err: unknown) {
      const error = err as Error;
      Toast({ title: "Error", description: error.message, color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-between items-center w-full">
                <div>
                  Fix Data: {field.toUpperCase()} ={" "}
                  <span className="text-danger">{value}</span>
                </div>
                {students.length > 1 && (
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    startContent={<Icon icon="lucide:copy-check" />}
                    onPress={() => {
                      if (!students[0]) return;
                      const firstRow = students[0];
                      setStudents((prev) =>
                        prev.map((row) => ({
                          ...row,
                          education: firstRow.education,
                          occupation: firstRow.occupation,
                        })),
                      );
                      Toast({
                        title: "Copied!",
                        description: "Copied top row to all rows",
                        color: "success",
                      });
                    }}
                  >
                    Copy Top Row to All
                  </Button>
                )}
              </div>
              <p className="text-sm font-normal text-default-500">
                Edit the fields directly and hit Save.
              </p>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center p-10 text-default-500">
                  Loading data...
                </div>
              ) : (
                <FormTable
                  data={students}
                  columns={columns}
                  onChange={setStudents}
                  keyField="id"
                  pageSize={10}
                  enableDelete={false}
                  enableAdd={false}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={saveUpdates} isLoading={saving}>
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
