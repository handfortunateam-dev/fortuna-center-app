"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";

export interface LookupOption {
    text: string;
    key: string;
    value: string;
}

export type LookupType = "teachers" | "students" | "classes";

export const lookupKeys = {
    all: ["lookup"] as const,
    type: (type: LookupType) => [...lookupKeys.all, type] as const,
};

async function fetchLookup(type: LookupType): Promise<ApiResponse<LookupOption[]>> {
    const { data } = await apiClient.get<ApiResponse<LookupOption[]>>(
        `/lookup?type=${type}`
    );
    return data;
}

// Hook untuk teachers
export function useTeachersLookup() {
    return useQuery({
        queryKey: lookupKeys.type("teachers"),
        queryFn: () => fetchLookup("teachers"),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
        select: (data) => data.data || [],
    });
}

// Hook untuk students
export function useStudentsLookup() {
    return useQuery({
        queryKey: lookupKeys.type("students"),
        queryFn: () => fetchLookup("students"),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        select: (data) => data.data || [],
    });
}

// Hook untuk classes
export function useClassesLookup() {
    return useQuery({
        queryKey: lookupKeys.type("classes"),
        queryFn: () => fetchLookup("classes"),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        select: (data) => data.data || [],
    });
}

// Generic hook untuk semua lookup types
export function useLookup(type: LookupType) {
    return useQuery({
        queryKey: lookupKeys.type(type),
        queryFn: () => fetchLookup(type),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        select: (data) => data.data || [],
    });
}
