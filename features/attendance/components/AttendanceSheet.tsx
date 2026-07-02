"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  RadioGroup,
  Radio,
  Input,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { AttendanceRecord, AttendanceStatus } from "../types";

interface AttendanceSheetProps {
  initialRecords: AttendanceRecord[];
  onSave: (records: AttendanceRecord[]) => void;
}

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  color: string;
}[] = [
  { value: "present", label: "Present", color: "success" },
  { value: "late", label: "Late", color: "warning" },
  { value: "excused", label: "Excused", color: "primary" },
  { value: "sick", label: "Sick", color: "danger" },
  { value: "absent", label: "Absent", color: "default" },
];

export function AttendanceSheet({
  initialRecords,
  onSave,
}: AttendanceSheetProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [filter, setFilter] = useState("");

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: status as AttendanceStatus }
          : r,
      ),
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, notes: note } : r)),
    );
  };

  const filteredRecords = records.filter((r) =>
    r.studentName.toLowerCase().includes(filter.toLowerCase()),
  );

  // Stats
  const stats = {
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
    sick: records.filter((r) => r.status === "sick").length,
    total: records.length,
  };

  return (
    <div className="space-y-4">
      {/* Controls & Stats */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-default-50 p-4 rounded-xl border border-default-200">
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="flex flex-col">
            <span className="text-xs text-default-500 uppercase font-bold">
              Present
            </span>
            <span className="text-2xl font-bold text-success">
              {stats.present}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-default-500 uppercase font-bold">
              Late
            </span>
            <span className="text-2xl font-bold text-warning">
              {stats.late}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-default-500 uppercase font-bold">
              Absent
            </span>
            <span className="text-2xl font-bold text-default-500">
              {stats.absent}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-default-500 uppercase font-bold">
              Excused/Sick
            </span>
            <span className="text-2xl font-bold text-primary">
              {stats.excused + stats.sick}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search student..."
            value={filter}
            onValueChange={setFilter}
            startContent={<Icon icon="lucide:search" />}
            className="w-full md:w-64"
          />
          <Button color="primary" onPress={() => onSave(records)}>
            Save Attendance
          </Button>
        </div>
      </div>

      <div className="border border-default-200 rounded-xl overflow-hidden">
        <Table aria-label="Attendance sheet">
          <TableHeader>
            <TableColumn>STUDENT</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>NOTES</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.studentId}>
                <TableCell>
                  <User
                    name={record.studentName}
                    description={record.studentId} // Simplified ID display
                    avatarProps={{ src: record.studentAvatar }}
                  />
                </TableCell>
                <TableCell>
                  <RadioGroup
                    orientation="horizontal"
                    value={record.status}
                    onValueChange={(val) =>
                      handleStatusChange(record.studentId, val)
                    }
                    size="sm"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        color={
                          option.color as
                            | "default"
                            | "primary"
                            | "secondary"
                            | "success"
                            | "warning"
                            | "danger"
                        }
                      >
                        {option.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Note..."
                    value={record.notes || ""}
                    onValueChange={(val) =>
                      handleNoteChange(record.studentId, val)
                    }
                    size="sm"
                    variant="bordered"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
