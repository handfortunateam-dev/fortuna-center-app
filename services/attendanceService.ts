import { StudentAttendanceSummary } from "@/features/attendance/types";
import { apiClient } from "@/lib/axios";

export const getStudentAttendance = async (studentId: string): Promise<StudentAttendanceSummary[]> => {
    try {
        // Current implementation ignores studentId param as the API route handles the "current user" logic (mocked to first student)
        const response = await apiClient.get<StudentAttendanceSummary[]>("/student/attendance");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch student attendance:", error);
        // Return empty array or throw, depending on error handling strategy.
        // For now, return empty array to prevent UI crash.
        return [];
    }
};

export interface ClassAttendanceData {
    class: {
        id: string;
        name: string;
        code: string;
        description: string | null;
    };
    sessions: Array<{
        id: string;
        date: string;
        status: string;
        actualStartTime: string | null;
        actualEndTime: string | null;
    }>;
    totalStudents: number;
    totalSessions: number;
    attendanceData: Array<{
        student: {
            id: string;
            name: string | null;
            email: string;
        };
        attendance: Array<{
            sessionId: string;
            sessionDate: string;
            sessionStatus: string;
            attendanceStatus: string | null;
            notes: string | null;
            checkedInAt: string | null;
        }>;
        stats: {
            present: number;
            late: number;
            absent: number;
            excused: number;
            sick: number;
        };
        attendanceRate: number;
    }>;
}

export const getClassAttendance = async (classId: string): Promise<ClassAttendanceData> => {
    try {
        const response = await apiClient.get<ClassAttendanceData>(`/teacher/classes/${classId}/attendance`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch class attendance:", error);
        throw error;
    }
};

export interface TeacherClass {
    id: string;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    enrollmentCount: number;
    totalSessions: number;
    completedSessions: number;
}

export const getTeacherClasses = async (): Promise<TeacherClass[]> => {
    try {
        const response = await apiClient.get<TeacherClass[]>("/teacher/classes");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch teacher classes:", error);
        return [];
    }
};

export interface TeacherSession {
    id: string;
    className: string;
    classCode: string;
    date: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    status: string;
    studentCount: number;
    attendanceRecorded: boolean;
    attendedCount: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
}

export const getTeacherSessions = async (): Promise<TeacherSession[]> => {
    try {
        const response = await apiClient.get<TeacherSession[]>("/teacher/sessions");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch teacher sessions:", error);
        return [];
    }
};

export interface AttendanceRecord {
    id: string;
    sessionId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    status: "present" | "late" | "absent" | "excused" | "sick";
    notes: string | null;
    checkedInAt: string | null;
    recordedAt: string | null;
}

export interface SessionAttendanceData {
    session: {
        id: string;
        date: string;
        status: string;
        className: string;
        classCode: string;
        startTime: string;
        endTime: string;
    };
    records: AttendanceRecord[];
    message?: string;
}

export const getSessionAttendance = async (sessionId: string): Promise<SessionAttendanceData> => {
    try {
        const response = await apiClient.get<SessionAttendanceData>(`/teacher/sessions/${sessionId}/attendance`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch session attendance:", error);
        throw error;
    }
};

export const updateSessionAttendance = async (
    sessionId: string,
    records: Partial<AttendanceRecord>[]
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.put(`/teacher/sessions/${sessionId}/attendance`, {
            records,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update attendance:", error);
        throw error;
    }
};

export const updateSessionStatus = async (
    sessionId: string,
    status: 'scheduled' | 'not_started' | 'in_progress' | 'completed' | 'cancelled'
): Promise<{ success: boolean; message: string; data: any }> => {
    try {
        const response = await apiClient.patch(`/teacher/sessions/${sessionId}/status`, {
            status,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update session status:", error);
        throw error;
    }
};

export interface ClassSchedule {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
    teachers?: { id: string; name: string | null }[];
}

export const getClassSchedules = async (classId: string): Promise<ClassSchedule[]> => {
    try {
        const response = await apiClient.get<ClassSchedule[]>(`/teacher/classes/${classId}/schedules`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch class schedules:", error);
        return [];
    }
};

export interface CreateSessionPayload {
    scheduleId: string;
    date: string;
    notes?: string;
}

export const createSession = async (payload: CreateSessionPayload): Promise<{ success: boolean; message: string; session: any }> => {
    try {
        const response = await apiClient.post("/teacher/sessions/create", payload);
        return response.data;
    } catch (error: any) {
        console.error("Failed to create session:", error);
        throw new Error(error.response?.data?.error || "Failed to create session");
    }
};

export interface TeacherDashboardData {
    overview: {
        totalClasses: number;
        totalStudents: number;
        todaySessionsCount: number;
        weekSessionsCount: number;
    };
    todaySessions: Array<{
        id: string;
        className: string;
        classCode: string;
        date: string;
        startTime: string;
        endTime: string;
        status: string;
    }>;
    attendanceStats: {
        total: number;
        present: number;
        late: number;
        absent: number;
        attendanceRate: number;
    };
    recentClasses: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    sessionsNeedingAttention: Array<{
        sessionId: string;
        sessionDate: string;
        className: string;
        classCode: string;
    }>;
}

export const getTeacherDashboard = async (): Promise<TeacherDashboardData> => {
    try {
        const response = await apiClient.get<TeacherDashboardData>("/teacher/dashboard");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch teacher dashboard:", error);
        throw error;
    }
};
