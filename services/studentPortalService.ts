"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";

export interface StudentAssignmentItem {
    id: string;
    title: string;
    dueDate: string | null;
    classId: string;
    className: string;
    status: string;
    maxScore: number;
    submissionStatus: string | null; // 'pending' | 'submitted' | 'graded' | 'late'
    submissionScore: number | null;
}

export interface Classmate {
    id: string;
    name: string;
    image: string | null;
    email: string | null;
}

export interface StudentClassItem {
    id: string;
    name: string;
    code: string;
    description: string | null;
    teachers: { name: string; image: string | null }[];
    imgUrl: string | null;
    bannerUrl: string | null;
    classmates: Classmate[];
}

// ... previous imports
import { IStudentAssignmentDetail, StudentSubmissionFormValues } from "@/features/lms/student-portal/interface";

// Lesson/Material types
export interface LessonMaterial {
    id: string;
    title: string;
    description: string | null;
    type: "video" | "pdf" | "link" | "text" | "file" | "ppt" | "audio";
    content: string | null;
    lessonId: string;
    order: number;
}

export interface StudentLesson {
    id: string;
    title: string;
    description: string | null;
    classId: string;
    order: number;
    materials: LessonMaterial[];
}

export interface StudentLessonsByClass {
    id: string;
    name: string;
    code: string;
    lessons: StudentLesson[];
}

// Keys
export const studentPortalKeys = {
    all: ["student-portal"] as const,
    assignments: () => [...studentPortalKeys.all, "assignments"] as const,
    assignmentDetail: (id: string) => [...studentPortalKeys.all, "assignment", id] as const,
    classes: () => [...studentPortalKeys.all, "classes"] as const,
    classDetail: (id: string) => [...studentPortalKeys.all, "class", id] as const,
    lessons: () => [...studentPortalKeys.all, "lessons"] as const,
    lessonsByClass: (classId: string) => [...studentPortalKeys.all, "lessons", classId] as const,
};

// ... existing fetch functions
async function fetchStudentAssignments(): Promise<ApiResponse<StudentAssignmentItem[]>> {
    const { data } = await apiClient.get<ApiResponse<StudentAssignmentItem[]>>("/student/assignments");
    return data;
}

async function fetchStudentClasses(): Promise<ApiResponse<StudentClassItem[]>> {
    const { data } = await apiClient.get<ApiResponse<StudentClassItem[]>>("/student/classes");
    return data;
}

async function fetchStudentClassDetail(id: string): Promise<ApiResponse<StudentClassItem>> {
    const { data } = await apiClient.get<ApiResponse<StudentClassItem>>(`/student/classes/${id}`);
    return data;
}

async function fetchStudentAssignmentDetail(id: string): Promise<ApiResponse<IStudentAssignmentDetail>> {
    const { data } = await apiClient.get<ApiResponse<IStudentAssignmentDetail>>(`/student/assignments/${id}`);
    return data;
}

export function useStudentAssignments() {
    return useQuery({
        queryKey: studentPortalKeys.assignments(),
        queryFn: fetchStudentAssignments,
        staleTime: 5 * 60 * 1000,
    });
}

export function useStudentAssignmentDetail(id: string) {
    return useQuery({
        queryKey: studentPortalKeys.assignmentDetail(id),
        queryFn: () => fetchStudentAssignmentDetail(id),
        enabled: !!id,
    });
}

export function submitAssignment(id: string, payload: StudentSubmissionFormValues) {
    return apiClient.post<ApiResponse<unknown>>(`/student/assignments/${id}/submit`, payload);
}

// ... existing useStudentClasses


export function useStudentClasses() {
    return useQuery({
        queryKey: studentPortalKeys.classes(),
        queryFn: fetchStudentClasses,
        staleTime: 5 * 60 * 1000,
    });
}

export function useStudentClassDetail(id: string) {
    return useQuery({
        queryKey: studentPortalKeys.classDetail(id),
        queryFn: () => fetchStudentClassDetail(id),
        enabled: !!id,
    });
}

// Lessons
async function fetchStudentLessons(): Promise<ApiResponse<StudentLessonsByClass[]>> {
    const { data } = await apiClient.get<ApiResponse<StudentLessonsByClass[]>>("/student/lessons");
    return data;
}

async function fetchStudentLessonsByClass(classId: string): Promise<ApiResponse<StudentLesson[]>> {
    const { data } = await apiClient.get<ApiResponse<StudentLesson[]>>(`/student/lessons?classId=${classId}`);
    return data;
}

export function useStudentLessons() {
    return useQuery({
        queryKey: studentPortalKeys.lessons(),
        queryFn: fetchStudentLessons,
        staleTime: 5 * 60 * 1000,
    });
}

export function useStudentLessonsByClass(classId: string) {
    return useQuery({
        queryKey: studentPortalKeys.lessonsByClass(classId),
        queryFn: () => fetchStudentLessonsByClass(classId),
        enabled: !!classId,
        staleTime: 5 * 60 * 1000,
    });
}
