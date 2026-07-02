"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import {
    IStudent,
    StudentFormValues,
    StudentListParams,
} from "@/features/lms/students/interface";

export const studentKeys = {
    all: ["students"] as const,
    lists: () => [...studentKeys.all, "list"] as const,
    list: (params?: StudentListParams) => [...studentKeys.lists(), params] as const,
    detail: (id: string) => [...studentKeys.all, "detail", id] as const,
};

async function fetchStudents(
    params?: StudentListParams
): Promise<ApiResponse<IStudent[]>> {
    const { data } = await apiClient.get<ApiResponse<IStudent[]>>("/students", {
        params,
    });
    return data;
}

export async function fetchStudent(id: string): Promise<ApiResponse<IStudent>> {
    const { data } = await apiClient.get<ApiResponse<IStudent>>(`/students/${id}`);
    return data;
}

export function useStudents(params?: StudentListParams) {
    return useQuery({
        queryKey: studentKeys.list(params),
        queryFn: () => fetchStudents(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

export function useStudentDetail(id?: string) {
    return useQuery({
        queryKey: id ? studentKeys.detail(id) : ["students", "detail", "unknown"],
        queryFn: () => fetchStudent(id as string),
        enabled: !!id,
    });
}

export function createStudent(payload: StudentFormValues) {
    return apiClient.post<ApiResponse<IStudent>>("/students", payload);
}

export function updateStudent(id: string, payload: Partial<StudentFormValues>) {
    return apiClient.patch<ApiResponse<IStudent>>(`/students/${id}`, payload);
}

export function deleteStudent(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/students/${id}`);
}
