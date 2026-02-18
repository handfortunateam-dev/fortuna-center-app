"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import {
  ClassEnrollmentFilters,
  ClassEnrollmentItem,
  ClassEnrollmentFormValues,
  ClassItem,
  ClassListParams,
  ClassFormValues,
  TeacherClassFilters,
  TeacherClassItem,
  TeacherClassFormValues,
} from "@/features/lms/classes/interfaces";

export const classKeys = {
  all: ["/classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (params?: ClassListParams) => [...classKeys.lists(), params] as const,
  detail: (id: string) => [...classKeys.all, "detail", id] as const,
};

export const teacherClassKeys = {
  all: ["teacher-classes"] as const,
  lists: () => [...teacherClassKeys.all, "list"] as const,
  list: (filters?: TeacherClassFilters) =>
    [...teacherClassKeys.lists(), filters] as const,
  detail: (id: string) => [...teacherClassKeys.all, "detail", id] as const,
};

export const classEnrollmentKeys = {
  all: ["class-enrollments"] as const,
  lists: () => [...classEnrollmentKeys.all, "list"] as const,
  list: (filters?: ClassEnrollmentFilters) =>
    [...classEnrollmentKeys.lists(), filters] as const,
  detail: (id: string) => [...classEnrollmentKeys.all, "detail", id] as const,
};

async function fetchClasses(
  params?: ClassListParams
): Promise<ApiResponse<ClassItem[]>> {
  const { data } = await apiClient.get<ApiResponse<ClassItem[]>>("/classes", {
    params: {
      ...params,
      isActive:
        typeof params?.isActive === "boolean"
          ? params.isActive
            ? "true"
            : "false"
          : undefined,
    },
  });

  return data;
}

export async function fetchClass(
  id: string
): Promise<ApiResponse<ClassItem>> {
  const { data } = await apiClient.get<ApiResponse<ClassItem>>(`/classes/${id}`);
  return data;
}

export async function fetchTeacherClasses(
  filters?: TeacherClassFilters
): Promise<ApiResponse<TeacherClassItem[]>> {
  const { data } = await apiClient.get<ApiResponse<TeacherClassItem[]>>(
    "/teacher-classes",
    {
      params: filters,
    }
  );

  return data;
}

export async function fetchTeacherClass(
  id: string
): Promise<ApiResponse<TeacherClassItem>> {
  const { data } = await apiClient.get<ApiResponse<TeacherClassItem>>(
    `/teacher-classes/${id}`
  );
  return data;
}

async function fetchClassEnrollments(
  filters?: ClassEnrollmentFilters
): Promise<ApiResponse<ClassEnrollmentItem[]>> {
  const { data } = await apiClient.get<ApiResponse<ClassEnrollmentItem[]>>(
    "/class-enrollments",
    {
      params: filters,
    }
  );

  return data;
}

export async function fetchClassEnrollment(
  id: string
): Promise<ApiResponse<ClassEnrollmentItem>> {
  const { data } = await apiClient.get<ApiResponse<ClassEnrollmentItem>>(
    `/class-enrollments/${id}`
  );
  return data;
}

export function useClasses(params?: ClassListParams) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => fetchClasses(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTeacherClasses(filters?: TeacherClassFilters) {
  return useQuery({
    queryKey: teacherClassKeys.list(filters),
    queryFn: () => fetchTeacherClasses(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useClassEnrollments(filters?: ClassEnrollmentFilters) {
  return useQuery({
    queryKey: classEnrollmentKeys.list(filters),
    queryFn: () => fetchClassEnrollments(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useClassDetail(id?: string) {
  return useQuery({
    queryKey: id ? classKeys.detail(id) : ["classes", "detail", "unknown"],
    queryFn: () => fetchClass(id as string),
    enabled: !!id,
  });
}

export function useTeacherClassDetail(id?: string) {
  return useQuery({
    queryKey: id
      ? teacherClassKeys.detail(id)
      : ["teacher-classes", "detail", "unknown"],
    queryFn: () => fetchTeacherClass(id as string),
    enabled: !!id,
  });
}

export function useClassEnrollmentDetail(id?: string) {
  return useQuery({
    queryKey: id
      ? classEnrollmentKeys.detail(id)
      : ["class-enrollments", "detail", "unknown"],
    queryFn: () => fetchClassEnrollment(id as string),
    enabled: !!id,
  });
}

export function createClass(payload: ClassFormValues) {
  return apiClient.post<ApiResponse<ClassItem>>("/classes", payload);
}

export function updateClass(id: string, payload: Partial<ClassFormValues>) {
  return apiClient.patch<ApiResponse<ClassItem>>(`/classes/${id}`, payload);
}

export function createTeacherClass(payload: TeacherClassFormValues) {
  return apiClient.post<ApiResponse<TeacherClassItem>>(
    "/teacher-classes",
    payload
  );
}

export function updateTeacherClass(
  id: string,
  payload: Partial<TeacherClassFormValues>
) {
  return apiClient.patch<ApiResponse<TeacherClassItem>>(
    `/teacher-classes/${id}`,
    payload
  );
}

export function createClassEnrollment(payload: ClassEnrollmentFormValues) {
  return apiClient.post<ApiResponse<ClassEnrollmentItem>>(
    "/class-enrollments",
    payload
  );
}

export function updateClassEnrollment(
  id: string,
  payload: Partial<ClassEnrollmentFormValues>
) {
  return apiClient.patch<ApiResponse<ClassEnrollmentItem>>(
    `/class-enrollments/${id}`,
    payload
  );
}
