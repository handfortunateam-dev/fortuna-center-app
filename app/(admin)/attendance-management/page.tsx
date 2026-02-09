"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Select,
  SelectItem,
  Input,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "late" | "excused" | "sick";
  notes: string | null;
  checkedInAt: string | null;
  recordedBy: string | null;
  recordedAt: string;
  updatedAt: string | null;

  // Session info
  sessionDate: string;
  sessionStatus: string;
  sessionNotes: string | null;

  // Schedule info
  scheduleId: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  scheduleLocation: string | null;
  scheduleClassId: string;
  scheduleTeacherId: string;

  // Student info
  studentName: string;
  studentEmail: string;

  // Class info
  className: string;

  // Additional names
  teacherName: string | null;
  recordedByName: string | null;
}

interface ClassOption {
  id: string;
  name: string;
}

const statusColorMap: Record<
  "present" | "absent" | "late" | "excused" | "sick",
  "success" | "danger" | "warning" | "default" | "primary"
> = {
  present: "success",
  absent: "danger",
  late: "warning",
  excused: "default",
  sick: "primary",
};

const statusLabelMap: Record<
  "present" | "absent" | "late" | "excused" | "sick",
  string
> = {
  present: "Hadir",
  absent: "Tidak Hadir",
  late: "Terlambat",
  excused: "Izin",
  sick: "Sakit",
};

export default function AttendanceManagementPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch classes for filter
  const { data: classes = [] } = useQuery<ClassOption[]>({
    queryKey: ["classes-attendance"],
    queryFn: async () => {
      const response = await fetch("/api/classes");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch classes");
      return data.data || [];
    },
  });

  // Fetch attendance records
  const {
    data: attendanceData,
    isLoading,
    error,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendances", selectedClass],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass) params.append("classId", selectedClass);

      const response = await fetch(
        `/api/class-attendances?${params.toString()}`,
      );
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch attendance");
      return data.data || [];
    },
  });

  // Filter and group attendance by session
  const filteredAndGroupedData = useMemo(() => {
    if (!attendanceData) return [];

    // Filter by search query
    let filtered = attendanceData;
    if (searchQuery) {
      filtered = attendanceData.filter(
        (record) =>
          record.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.scheduleLocation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Group by session
    const grouped = filtered.reduce(
      (acc, record) => {
        const sessionKey = record.sessionId;
        if (!acc[sessionKey]) {
          acc[sessionKey] = {
            sessionId: record.sessionId,
            sessionDate: record.sessionDate,
            scheduleStartTime: record.scheduleStartTime,
            scheduleEndTime: record.scheduleEndTime,
            scheduleLocation: record.scheduleLocation,
            sessionNotes: record.sessionNotes,
            className: record.className,
            teacherName: record.teacherName,
            scheduleClassId: record.scheduleClassId,
            attendances: [],
          };
        }
        acc[sessionKey].attendances.push(record);
        return acc;
      },
      {} as Record<
        string,
        {
          sessionId: string;
          sessionDate: string;
          scheduleStartTime: string;
          scheduleEndTime: string;
          scheduleLocation: string | null;
          sessionNotes: string | null;
          className: string;
          teacherName: string | null;
          scheduleClassId: string;
          attendances: AttendanceRecord[];
        }
      >,
    );

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    );
  }, [attendanceData, searchQuery]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!attendanceData)
      return { total: 0, present: 0, absent: 0, late: 0, excused: 0, sick: 0 };

    return {
      total: attendanceData.length,
      present: attendanceData.filter((r) => r.status === "present").length,
      absent: attendanceData.filter((r) => r.status === "absent").length,
      late: attendanceData.filter((r) => r.status === "late").length,
      excused: attendanceData.filter((r) => r.status === "excused").length,
      sick: attendanceData.filter((r) => r.status === "sick").length,
    };
  }, [attendanceData]);

  if (error) {
    return (
      <StateMessage
        icon="solar:danger-circle-bold-duotone"
        title="Failed to Load Attendance"
        description={error instanceof Error ? error.message : "Unknown error"}
        color="danger"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Heading className="text-3xl font-bold">Attendance Management</Heading>
        <Text className="text-default-500 mt-1">
          Monitor student attendance across all classes and sessions
        </Text>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:clipboard-list-bold-duotone"
                className="w-8 h-8 text-default-400"
              />
              <div>
                <Text className="text-xs text-default-500">Total Records</Text>
                <Heading className="text-2xl font-bold">
                  {statistics.total}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:check-circle-bold-duotone"
                className="w-8 h-8 text-success"
              />
              <div>
                <Text className="text-xs text-default-500">Present</Text>
                <Heading className="text-2xl font-bold text-success">
                  {statistics.present}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:close-circle-bold-duotone"
                className="w-8 h-8 text-danger"
              />
              <div>
                <Text className="text-xs text-default-500">Absent</Text>
                <Heading className="text-2xl font-bold text-danger">
                  {statistics.absent}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:clock-circle-bold-duotone"
                className="w-8 h-8 text-warning"
              />
              <div>
                <Text className="text-xs text-default-500">Late</Text>
                <Heading className="text-2xl font-bold text-warning">
                  {statistics.late}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:document-bold-duotone"
                className="w-8 h-8 text-default-400"
              />
              <div>
                <Text className="text-xs text-default-500">Excused</Text>
                <Heading className="text-2xl font-bold">
                  {statistics.excused}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:health-bold-duotone"
                className="w-8 h-8 text-primary"
              />
              <div>
                <Text className="text-xs text-default-500">Sick</Text>
                <Heading className="text-2xl font-bold text-primary">
                  {statistics.sick}
                </Heading>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Class"
              placeholder="All Classes"
              selectedKeys={selectedClass ? [selectedClass] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedClass(selected || "");
              }}
              startContent={
                <Icon
                  icon="solar:book-bookmark-bold-duotone"
                  className="w-4 h-4"
                />
              }
            >
              <SelectItem key="" value="">
                All Classes
              </SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              placeholder="Search by student, class, location, or teacher..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
              }
              isClearable
              onClear={() => setSearchQuery("")}
            />
          </div>
        </CardBody>
      </Card>

      {/* Attendance Records Grouped by Session */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" label="Loading attendance records..." />
        </div>
      ) : filteredAndGroupedData.length === 0 ? (
        <StateMessage
          icon="solar:calendar-mark-bold-duotone"
          title="No Attendance Records"
          description="No attendance records found. Try adjusting your filters."
          color="default"
        />
      ) : (
        <div className="space-y-6">
          {filteredAndGroupedData.map((session) => (
            <Card key={session.sessionId} className="shadow-sm">
              <CardHeader className="flex flex-col items-start gap-2 px-6 py-4 border-b">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:video-library-bold-duotone"
                      className="w-6 h-6 text-primary"
                    />
                    <div>
                      <Heading className="text-lg font-semibold">
                        {session.sessionNotes ||
                          `${session.className} Class Session`}
                      </Heading>
                      <div className="flex items-center gap-4 mt-1">
                        <Text className="text-sm text-default-500">
                          <Icon
                            icon="solar:book-bold-duotone"
                            className="inline w-4 h-4 mr-1"
                          />
                          {session.className}
                        </Text>
                        <Text className="text-sm text-default-500">
                          <Icon
                            icon="solar:calendar-bold-duotone"
                            className="inline w-4 h-4 mr-1"
                          />
                          {format(new Date(session.sessionDate), "dd MMM yyyy")}
                        </Text>
                        <Text className="text-sm text-default-500">
                          <Icon
                            icon="solar:clock-circle-bold-duotone"
                            className="inline w-4 h-4 mr-1"
                          />
                          {session.scheduleStartTime} -{" "}
                          {session.scheduleEndTime}
                        </Text>
                        {session.scheduleLocation && (
                          <Text className="text-sm text-default-500">
                            <Icon
                              icon="solar:map-point-bold-duotone"
                              className="inline w-4 h-4 mr-1"
                            />
                            {session.scheduleLocation}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <Chip
                    startContent={
                      <Icon
                        icon="solar:user-bold-duotone"
                        className="w-4 h-4"
                      />
                    }
                    variant="flat"
                    color="primary"
                  >
                    Teacher: {session.teacherName || "Unknown"}
                  </Chip>
                </div>
              </CardHeader>

              <CardBody className="p-0">
                <Table removeWrapper>
                  <TableHeader>
                    <TableColumn>STUDENT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>CHECK-IN TIME</TableColumn>
                    <TableColumn>RECORDED BY</TableColumn>
                    <TableColumn>NOTES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {session.attendances.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <Text className="font-medium">
                              {record.studentName}
                            </Text>
                            <Text className="text-xs text-default-400">
                              {record.studentEmail}
                            </Text>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={statusColorMap[record.status]}
                            variant="flat"
                            size="sm"
                          >
                            {statusLabelMap[record.status]}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {record.checkedInAt ? (
                            <Text className="text-sm">
                              {format(new Date(record.checkedInAt), "HH:mm:ss")}
                            </Text>
                          ) : (
                            <Text className="text-sm text-default-400">-</Text>
                          )}
                        </TableCell>
                        <TableCell>
                          <Text className="text-sm">
                            {record.recordedByName || "System"}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Text className="text-sm text-default-500">
                            {record.notes || "-"}
                          </Text>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
