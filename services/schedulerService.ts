"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// Query Keys
export const schedulerKeys = {
    all: ["schedules"] as const,
    lists: () => [...schedulerKeys.all, "list"] as const,
    list: (filters?: ScheduleFilters) => [...schedulerKeys.lists(), filters] as const,
    detail: (id: string) => [...schedulerKeys.all, "detail", id] as const,
    sessions: (scheduleId?: string) => [...schedulerKeys.all, "sessions", scheduleId] as const,
    attendances: (sessionId: string) => [...schedulerKeys.all, "attendances", sessionId] as const,
};

// Interfaces
interface ScheduleFilters {
    teacherId?: string;
    classId?: string;
    dayOfWeek?: number;
    isActive?: boolean;
}

interface CreateSchedulePayload {
    classId: string;
    teacherIds: string[];
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
}

interface UpdateSchedulePayload {
    classId?: string;
    teacherIds?: string[];
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    location?: string;
    notes?: string;
    isActive?: boolean;
}

// ============ SCHEDULES ============

// GET all schedules
export function useSchedules(filters?: ScheduleFilters) {
    return useQuery({
        queryKey: schedulerKeys.list(filters),
        queryFn: async () => {
            const { data } = await apiClient.get("/class-schedules", { params: filters });
            return data;
        },
    });
}

// GET single schedule
export function useScheduleDetail(id?: string) {
    return useQuery({
        queryKey: id ? schedulerKeys.detail(id) : ["schedules", "detail", "unknown"],
        queryFn: async () => {
            const { data } = await apiClient.get(`/class-schedules/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

// CREATE schedule
export function createSchedule(payload: CreateSchedulePayload) {
    return apiClient.post("/class-schedules", payload);
}

// UPDATE schedule (for drag & drop)
export function updateSchedule(id: string, payload: UpdateSchedulePayload) {
    return apiClient.patch(`/class-schedules/${id}`, payload);
}

// DELETE schedule
export function deleteSchedule(id: string) {
    return apiClient.delete(`/class-schedules/${id}`);
}

// ============ SESSIONS ============

// GET sessions for a date range
export function useSessions(params: { startDate: string; endDate: string; scheduleId?: string }) {
    return useQuery({
        queryKey: ["sessions", params],
        queryFn: async () => {
            const { data } = await apiClient.get("/class-sessions", { params });
            return data;
        },
    });
}

// GENERATE sessions (Admin/Staff)
export function generateSessions(payload: { scheduleIds: string[]; startDate: string; endDate: string }) {
    return apiClient.post("/class-sessions/generate", payload);
}

// UPDATE session status
export function updateSessionStatus(id: string, status: string) {
    return apiClient.patch(`/class-sessions/${id}/status`, { status });
}

// ============ ATTENDANCES ============

// GET attendances for a session
export function useAttendances(sessionId: string) {
    return useQuery({
        queryKey: schedulerKeys.attendances(sessionId),
        queryFn: async () => {
            const { data } = await apiClient.get(`/class-sessions/${sessionId}/attendances`);
            return data;
        },
        enabled: !!sessionId,
    });
}

// BULK update attendances
export function updateAttendances(sessionId: string, attendances: { studentId: string; status: string; notes?: string }[]) {
    return apiClient.put(`/class-sessions/${sessionId}/attendances`, { attendances });
}
