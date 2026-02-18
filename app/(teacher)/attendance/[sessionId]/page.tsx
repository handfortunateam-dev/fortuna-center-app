"use client";

import React, { useState } from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Button,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessionAttendance,
  updateSessionAttendance,
  AttendanceRecord,
} from "@/services/attendanceService";

const ATTENDANCE_STATUS = [
  {
    key: "present",
    label: "Present",
    icon: "lucide:check-circle",
    color: "success",
  },
  { key: "late", label: "Late", icon: "lucide:clock", color: "warning" },
  { key: "absent", label: "Absent", icon: "lucide:x-circle", color: "danger" },
  {
    key: "excused",
    label: "Excused",
    icon: "lucide:file-check",
    color: "primary",
  },
  {
    key: "sick",
    label: "Sick",
    icon: "lucide:heart-pulse",
    color: "secondary",
  },
];

export default function AttendanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const queryClient = useQueryClient();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Mutation to start session (update status to in_progress)
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/teacher/sessions/${sessionId}/start`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to start session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-attendance", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["session-attendance", sessionId],
    queryFn: () => getSessionAttendance(sessionId),
  });

  React.useEffect(() => {
    if (data?.records) {
      setRecords(data.records);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (records: Partial<AttendanceRecord>[]) =>
      updateSessionAttendance(sessionId, records),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-attendance", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
      setHasChanges(false);
      router.push("/attendance");
    },
  });

  const handleStatusChange = (recordId: string, status: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, status: status as any } : r,
      ),
    );
    setHasChanges(true);
  };

  const handleNotesChange = (recordId: string, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, notes } : r)),
    );
    setHasChanges(true);
  };

  const handleBulkAction = (status: string) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: status as any })));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      records.map((r) => ({
        id: r.id,
        status: r.status,
        notes: r.notes,
      })),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Icon icon="lucide:alert-circle" className="w-16 h-16 text-danger" />
        <Text>Failed to load session data</Text>
      </div>
    );
  }

  const { session } = data;
  const isScheduled = session.status === "scheduled";
  const isNotStarted = session.status === "not_started";
  const canEditAttendance =
    session.status === "in_progress" || session.status === "completed";

  const stats = records.reduce(
    (acc, r) => {
      acc[r.status]++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0, sick: 0 } as Record<
      string,
      number
    >,
  );

  const handleStartSession = () => {
    startSessionMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button isIconOnly variant="light" onPress={() => router.back()}>
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Chip size="sm" variant="flat" color="secondary">
              {session.classCode}
            </Chip>
            <Chip size="sm" variant="dot" color="primary">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Chip>
          </div>
          <Heading as="h1" size="2xl" weight="bold">
            {session.className}
          </Heading>
          <Text color="muted">
            {session.startTime} - {session.endTime}
          </Text>
        </div>
      </div>

      {/* Session Status Warning */}
      {(isScheduled || isNotStarted) && (
        <Card className="border-2 border-warning bg-warning-50 dark:bg-warning-100/10">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <Icon
                icon="lucide:alert-triangle"
                className="w-8 h-8 text-warning shrink-0"
              />
              <div className="flex-1">
                <Heading className="text-lg font-bold text-warning-700 dark:text-warning mb-2">
                  {isScheduled
                    ? "Session Not Started"
                    : "Session Ready to Start"}
                </Heading>
                <Text className="text-warning-700 dark:text-warning-300 mb-4">
                  {isScheduled
                    ? "This session is still scheduled. You need to start the session before you can mark attendance."
                    : "This session is ready to begin. Start the session to enable attendance marking."}
                </Text>
                <div className="flex items-center gap-3">
                  <Button
                    color="warning"
                    variant="solid"
                    startContent={<Icon icon="lucide:play-circle" />}
                    onPress={handleStartSession}
                    isLoading={startSessionMutation.isPending}
                  >
                    Start Session Now
                  </Button>
                  <Chip color="warning" variant="flat" size="sm">
                    Status: {isScheduled ? "Scheduled" : "Not Started"}
                  </Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ATTENDANCE_STATUS.map((status) => (
          <Card key={status.key} className="border border-default-200">
            <CardBody className="p-3 text-center">
              <div className={`text-${status.color} font-bold text-2xl`}>
                {stats[status.key] || 0}
              </div>
              <div className="text-xs text-default-600 uppercase mt-1">
                {status.label}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      {canEditAttendance && (
        <Card className="border border-default-200">
          <CardBody className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Text weight="semibold" className="mr-2">
                Quick Actions:
              </Text>
              <Button
                size="sm"
                color="success"
                variant="flat"
                startContent={<Icon icon="lucide:check-circle" />}
                onPress={() => handleBulkAction("present")}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<Icon icon="lucide:x-circle" />}
                onPress={() => handleBulkAction("absent")}
              >
                Mark All Absent
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Attendance Table */}
      <Card className="border border-default-200">
        <CardBody className="p-0">
          <Table aria-label="Attendance sheet" removeWrapper>
            <TableHeader>
              <TableColumn>STUDENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>NOTES</TableColumn>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {record.studentName}
                      </span>
                      <span className="text-xs text-default-400">
                        {record.studentEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="sm"
                      selectedKeys={[record.status]}
                      onSelectionChange={(keys) => {
                        const status = Array.from(keys)[0] as string;
                        if (status) handleStatusChange(record.id, status);
                      }}
                      className="min-w-[150px]"
                      aria-label="Attendance status"
                      isDisabled={!canEditAttendance}
                    >
                      {ATTENDANCE_STATUS.map((status) => (
                        <SelectItem key={status.key} textValue={status.label}>
                          <div className="flex items-center gap-2">
                            <Icon icon={status.icon} className="w-4 h-4" />
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      size="sm"
                      placeholder="Add notes (optional)"
                      value={record.notes || ""}
                      onChange={(e) =>
                        handleNotesChange(record.id, e.target.value)
                      }
                      minRows={1}
                      maxRows={3}
                      className="min-w-[200px]"
                      isDisabled={!canEditAttendance}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="light" onPress={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {hasChanges && (
            <Chip color="warning" variant="flat">
              Unsaved Changes
            </Chip>
          )}
          <Button
            color="primary"
            size="lg"
            startContent={<Icon icon="lucide:save" />}
            onPress={handleSave}
            isLoading={updateMutation.isPending}
            isDisabled={!hasChanges}
          >
            Save Attendance
          </Button>
        </div>
      </div>
    </div>
  );
}
