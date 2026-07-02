"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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
  Skeleton,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { parseDate, DateValue } from "@internationalized/date";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Toast } from "@/components/toast";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";
import { format } from "date-fns";
import * as XLSX from "xlsx";

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
  sessionTeacherId: string;

  // Student info
  studentName: string;
  studentEmail: string;

  // Class info
  className: string;

  // Additional names
  teacherName: string | null;
  recordedByName: string | null;
}

interface TeacherInfo {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  code: string | null;
}

interface ClassDetail {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  teacherClasses: {
    teacher: TeacherInfo;
  }[];
  classSchedules: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location: string | null;
    teachers: {
      teacher: TeacherInfo;
    }[];
  }[];
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

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AttendanceSkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="flex flex-col items-start gap-2 px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-64 rounded-lg mb-2" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-36 rounded-lg" />
                    <Skeleton className="h-4 w-28 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-40 rounded-full" />
            </div>
          </CardHeader>

          <CardBody className="p-0">
            <Table removeWrapper aria-label="Skeleton table">
              <TableHeader>
                <TableColumn>STUDENT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CHECK-IN TIME</TableColumn>
                <TableColumn>RECORDED BY</TableColumn>
                <TableColumn>NOTES</TableColumn>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 rounded-lg" />
                        <Skeleton className="h-3 w-48 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default function ClassAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch classes for the dropdown switcher
  const { data: classes = [] } = useQuery<ClassOption[]>({
    queryKey: ["classes-attendance"],
    queryFn: async () => {
      const response = await fetch("/api/classes?limit=100");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch classes");
      return data.data || [];
    },
  });

  // Fetch all teachers for the edit modal
  const { data: allTeachers = [] } = useQuery<
    {
      id: string;
      userId: string | null;
      firstName: string;
      lastName: string;
      email: string;
    }[]
  >({
    queryKey: ["all-teachers"],
    queryFn: async () => {
      const response = await fetch("/api/teachers?limit=1000");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch teachers");
      return data.data || [];
    },
  });

  // Fetch specialized class details (teachers, schedules)
  const { data: classDetail, isLoading: isLoadingDetail } =
    useQuery<ClassDetail>({
      queryKey: ["attendance-class-detail", classId],
      queryFn: async () => {
        const response = await fetch(
          `/api/attendance-management/class-details/${classId}`,
        );
        const data = await response.json();
        if (!data.success)
          throw new Error(data.message || "Failed to fetch class details");
        return data.data;
      },
      enabled: !!classId,
    });

  // Fetch attendance records specifically for this class
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    error,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendances", classId],
    queryFn: async () => {
      const response = await fetch(`/api/class-attendances?classId=${classId}`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch attendance");
      return data.data || [];
    },
    enabled: !!classId,
  });

  const queryClient = useQueryClient();

  // Edit Session State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{
    id: string;
    date: string;
    notes: string;
    teacherId: string | null;
  } | null>(null);

  const updateSessionMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      date: string;
      notes: string;
      teacherId?: string | null;
    }) => {
      const response = await fetch(`/api/class-sessions/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          notes: data.notes,
          teacherId: data.teacherId,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Update failed");
      return result.data;
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Session updated successfully",
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["attendances", classId] });
      setIsEditModalOpen(false);
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    },
  });

  const handleEditSession = (session: {
    sessionId: string;
    sessionDate: string;
    sessionNotes: string | null;
    attendances: AttendanceRecord[];
  }) => {
    setEditingSession({
      id: session.sessionId,
      date: session.sessionDate,
      notes: session.sessionNotes || "",
      teacherId: session.attendances[0]?.sessionTeacherId || null,
    });
    setIsEditModalOpen(true);
  };

  const selectedClassName = useMemo(() => {
    const cls = classDetail || classes.find((c) => c.id === classId);
    if (!cls) return "Class";
    return cls.code ? `${cls.code} - ${cls.name}` : cls.name;
  }, [classDetail, classes, classId]);

  // Filter and group attendance by session
  const filteredAndGroupedData = useMemo(() => {
    if (!attendanceData) return [];

    let filtered = attendanceData;
    if (searchQuery) {
      filtered = attendanceData.filter(
        (record) =>
          record.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.sessionNotes
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.scheduleLocation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

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

  const handleExportToExcel = () => {
    if (!attendanceData || attendanceData.length === 0) {
      Toast({
        title: "No data to export",
        description: "There are no attendance records to export.",
        color: "warning",
      });
      return;
    }

    // Prepare data for export
    const exportData = filteredAndGroupedData.flatMap((session) =>
      session.attendances.map((record) => ({
        Date: format(new Date(session.sessionDate), "dd MMM yyyy"),
        Session: session.sessionNotes || `${session.className} Session`,
        "Start Time": session.scheduleStartTime,
        "End Time": session.scheduleEndTime,
        Location: session.scheduleLocation || "N/A",
        Student: record.studentName,
        Email: record.studentEmail,
        Status: statusLabelMap[record.status],
        "Check-in": record.checkedInAt
          ? format(new Date(record.checkedInAt), "HH:mm")
          : "-",
        "Recorded By": record.recordedByName || "N/A",
        Notes: record.notes || "-",
      })),
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Generate and download file
    const fileName = `Attendance_${selectedClassName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    Toast({
      title: "Export Success",
      description: `Attendance data exported to ${fileName}`,
      color: "success",
    });
  };

  if (error) {
    return (
      <StateMessage
        icon="solar:danger-circle-bold-duotone"
        title="Failed to Load Attendance"
        message={error instanceof Error ? error.message : "Unknown error"}
        type="error"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Heading className="text-3xl font-bold">
            {selectedClassName} Attendance
          </Heading>
          <Text className="text-default-500 mt-1">
            Viewing all attendance sessions for this class
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            color="success"
            onPress={handleExportToExcel}
            startContent={
              <Icon icon="solar:file-download-bold-duotone" width={18} />
            }
          >
            Export to Excel
          </Button>
          <Button
            variant="flat"
            color="primary"
            onPress={() => router.push("/attendance-management")}
            startContent={
              <Icon icon="solar:arrow-left-bold-duotone" width={18} />
            }
          >
            Back to Classes
          </Button>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <Text className="text-xs text-default-500">
                    Total Records
                  </Text>
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

        {/* Teachers and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lecturers */}
          <Card className="shadow-sm">
            <CardHeader className="px-6 py-4 border-b flex items-center gap-2">
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                className="text-primary w-5 h-5"
              />
              <Heading className="text-lg font-semibold">Lecturers</Heading>
            </CardHeader>
            <CardBody className="p-4">
              {isLoadingDetail ? (
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded-lg" />
                  </div>
                </div>
              ) : classDetail?.teacherClasses?.length ? (
                <div className="flex flex-wrap gap-4">
                  {classDetail.teacherClasses.map(({ teacher }) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-default-50 border border-default-200 min-w-[200px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <Text className="font-semibold text-sm line-clamp-1">
                          {teacher.name}
                        </Text>
                        <Text className="text-xs text-default-400 line-clamp-1">
                          {teacher.email}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-default-400 italic text-sm">
                  No regular lecturers assigned.
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Weekly Schedule */}
          <Card className="shadow-sm">
            <CardHeader className="px-6 py-4 border-b flex items-center gap-2">
              <Icon
                icon="solar:calendar-bold-duotone"
                className="text-primary w-5 h-5"
              />
              <Heading className="text-lg font-semibold">
                Weekly Schedule
              </Heading>
            </CardHeader>
            <CardBody className="p-4">
              {isLoadingDetail ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : classDetail?.classSchedules?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classDetail.classSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 rounded-xl border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Chip
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="font-bold"
                        >
                          {dayNames[schedule.dayOfWeek]}
                        </Chip>
                        <Text className="text-xs font-mono font-semibold">
                          {schedule.startTime.substring(0, 5)} -{" "}
                          {schedule.endTime.substring(0, 5)}
                        </Text>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-default-500">
                        <Icon
                          icon="solar:map-point-bold-duotone"
                          className="w-3 h-3"
                        />
                        {schedule.location || "Online / TBD"}
                      </div>
                      {schedule.teachers && schedule.teachers.length > 0 && (
                        <div className="mt-2 flex -space-x-2">
                          {schedule.teachers.map(({ teacher }) => (
                            <div
                              key={teacher.id}
                              title={teacher.name}
                              className="w-6 h-6 rounded-full border-2 border-white bg-primary text-[10px] flex items-center justify-center text-white"
                            >
                              {teacher.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-default-400 italic text-sm">
                  No recurring schedule set.
                </Text>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Switch Class"
                placeholder={selectedClassName}
                selectedKeys={[classId]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected)
                    router.push(`/attendance-management/${selected}`);
                }}
                startContent={
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
                    className="w-4 h-4"
                  />
                }
              >
                {classes.map((cls) => (
                  <SelectItem
                    key={cls.id}
                    textValue={`${cls.code || "No Code"} - ${cls.name}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {cls.code || "No Code"}
                      </span>
                      <span className="text-xs text-default-500">
                        {cls.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Input
                placeholder="Search by student, session, location, or teacher..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={
                  <Icon
                    icon="solar:magnifer-bold-duotone"
                    className="w-4 h-4"
                  />
                }
                isClearable
                onClear={() => setSearchQuery("")}
              />
            </div>
          </CardBody>
        </Card>

        {/* Attendance Records Grouped by Session */}
        {isLoadingAttendance ? (
          <AttendanceSkeletonLoader />
        ) : filteredAndGroupedData.length === 0 ? (
          <StateMessage
            icon="solar:calendar-mark-bold-duotone"
            title="No Attendance Records"
            message="No attendance records found for this class. Try adjusting your filters or checking another class."
            type="empty"
          />
        ) : (
          <div className="space-y-6">
            {filteredAndGroupedData.map((session) => (
              <Card
                key={session.sessionId}
                className="shadow-sm overflow-hidden border-none"
              >
                <CardHeader className="flex flex-col items-start gap-2 px-6 py-4 border-b bg-default-50/50">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon
                          icon="solar:video-library-bold-duotone"
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <Heading className="text-lg font-semibold flex items-center gap-2">
                          {session.sessionNotes ||
                            `${session.className} Session`}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-default-400 hover:text-primary transition-colors h-7 w-7"
                            onPress={() => handleEditSession(session)}
                          >
                            <Icon icon="solar:pen-bold-duotone" width={16} />
                          </Button>
                        </Heading>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <Text className="text-sm text-default-500 flex items-center gap-1">
                            <Icon
                              icon="solar:calendar-bold-duotone"
                              className="w-4 h-4"
                            />
                            {format(
                              new Date(session.sessionDate),
                              "dd MMM yyyy",
                            )}
                          </Text>
                          <Text className="text-sm text-default-500 flex items-center gap-1">
                            <Icon
                              icon="solar:clock-circle-bold-duotone"
                              className="w-4 h-4"
                            />
                            {session.scheduleStartTime} -{" "}
                            {session.scheduleEndTime}
                          </Text>
                          {session.scheduleLocation && (
                            <Text className="text-sm text-default-500 flex items-center gap-1">
                              <Icon
                                icon="solar:map-point-bold-duotone"
                                className="w-4 h-4"
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
                      color="secondary"
                      className="hidden sm:flex border-none font-medium"
                    >
                      <span className="text-xs mr-1 opacity-70">Teacher:</span>
                      {session.teacherName || "Unassigned"}
                    </Chip>
                  </div>
                </CardHeader>

                <CardBody className="p-0">
                  <Table removeWrapper aria-label="Attendance table">
                    <TableHeader>
                      <TableColumn>STUDENT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>CHECK-IN TIME</TableColumn>
                      <TableColumn>RECORDED BY</TableColumn>
                      <TableColumn>NOTES</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {session.attendances.map((record: AttendanceRecord) => (
                        <TableRow
                          key={record.id}
                          className="hover:bg-default-50 transition-colors"
                        >
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
                              className="capitalize"
                            >
                              {statusLabelMap[record.status]}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {record.checkedInAt ? (
                              <Text className="text-sm">
                                {format(
                                  new Date(record.checkedInAt),
                                  "HH:mm:ss",
                                )}
                              </Text>
                            ) : (
                              <Text className="text-sm text-default-400">
                                -
                              </Text>
                            )}
                          </TableCell>
                          <TableCell>
                            <Text className="text-sm">
                              {record.recordedByName || "System"}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text
                              className="text-sm text-default-500 line-clamp-1 max-w-[200px]"
                              title={record.notes || ""}
                            >
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

      <EditSessionModal
        key={editingSession?.id}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        session={editingSession}
        teachers={allTeachers}
        onUpdate={(data) => updateSessionMutation.mutate(data)}
        isLoading={updateSessionMutation.isPending}
      />
    </div>
  );
}

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    date: string;
    notes: string;
    teacherId: string | null;
  } | null;
  teachers: {
    id: string;
    userId: string | null;
    email: string;
    firstName: string;
    lastName: string;
  }[];
  onUpdate: (data: {
    id: string;
    date: string;
    notes: string;
    teacherId: string | null;
  }) => void;
  isLoading: boolean;
}

function EditSessionModal({
  isOpen,
  onClose,
  session,
  teachers,
  onUpdate,
  isLoading,
}: EditSessionModalProps) {
  const [date, setDate] = useState<DateValue | null>(() => {
    if (session) {
      try {
        return parseDate(session.date);
      } catch {
        console.error("Failed to parse date", session.date);
      }
    }
    return null;
  });
  const [notes, setNotes] = useState(session?.notes || "");
  const [teacherId, setTeacherId] = useState<string>(session?.teacherId || "");

  const handleSubmit = () => {
    if (!session || !date) return;
    onUpdate({
      id: session.id,
      date: date.toString(),
      notes: notes,
      teacherId: teacherId || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Edit Session</ModalHeader>
        <ModalBody className="gap-4">
          <div className="space-y-1">
            <Text className="text-sm font-medium">Session Date</Text>
            <DatePicker
              aria-label="Session Date"
              value={date}
              onChange={setDate}
              variant="flat"
            />
          </div>
          <div className="space-y-1">
            <Text className="text-sm font-medium">Session Title / Notes</Text>
            <Input
              placeholder="e.g. Numbers, Intro to Algebra"
              value={notes}
              onValueChange={setNotes}
              variant="flat"
            />
          </div>
          <div className="space-y-1">
            <Text className="text-sm font-medium">Assign Teacher</Text>
            <Select
              aria-label="Assign Teacher"
              placeholder="Select a teacher"
              selectedKeys={teacherId ? [teacherId] : []}
              onSelectionChange={(keys) =>
                setTeacherId(Array.from(keys)[0] as string)
              }
              variant="flat"
              startContent={<Icon icon="solar:user-bold" className="w-4 h-4" />}
            >
              {teachers.map((t) => (
                <SelectItem
                  key={t.userId || ""}
                  textValue={`${t.firstName} ${t.lastName}`}
                  description={t.email}
                >
                  <span className="font-medium">
                    {t.firstName} {t.lastName}
                  </span>
                </SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!date}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
