"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import {
    IAssignment,
    AssignmentFormValues,
    AssignmentListParams,
} from "@/features/lms/assignments-by-teacher/interface";

export const assignmentKeys = {
    all: ["assignments"] as const,
    lists: () => [...assignmentKeys.all, "list"] as const,
    list: (params?: AssignmentListParams) =>
        [...assignmentKeys.lists(), params] as const,
    details: () => [...assignmentKeys.all, "detail"] as const,
    detail: (id: string) => [...assignmentKeys.details(), id] as const,
};

// Fetch assignments
async function fetchAssignments(
    params?: AssignmentListParams
): Promise<ApiResponse<IAssignment[]>> {
    const { data } = await apiClient.get<ApiResponse<IAssignment[]>>(
        "/assignments-by-teacher",
        {
            params,
        }
    );
    return data;
}

// Fetch single assignment
async function fetchAssignment(id: string): Promise<ApiResponse<IAssignment>> {
    const { data } = await apiClient.get<ApiResponse<IAssignment>>(
        `/assignments-by-teacher/${id}`
    );
    return data;
}

// Hooks
export function useAssignments(params?: AssignmentListParams) {
    return useQuery({
        queryKey: assignmentKeys.list(params),
        queryFn: () => fetchAssignments(params),
        staleTime: 5 * 60 * 1000,
    });
}

export function useAssignmentDetail(id?: string) {
    return useQuery({
        queryKey: id ? assignmentKeys.detail(id) : ["assignments", "detail", "unknown"],
        queryFn: () => fetchAssignment(id as string),
        enabled: !!id,
    });
}

// Mutations
export function createAssignment(payload: AssignmentFormValues) {
    return apiClient.post<ApiResponse<IAssignment>>("/assignments-by-teacher", payload);
}

export function updateAssignment(
    id: string,
    payload: Partial<AssignmentFormValues>
) {
    return apiClient.patch<ApiResponse<IAssignment>>(`/assignments-by-teacher/${id}`, payload);
}

export function deleteAssignment(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/assignments-by-teacher/${id}`);
}
