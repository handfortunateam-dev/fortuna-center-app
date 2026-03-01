"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Changelog, ChangelogFilters, CreateChangelogPayload, UpdateChangelogPayload } from "../interfaces";

export const changeLogKeys = {
    all: ["changelogs"] as const,
    lists: () => [...changeLogKeys.all, "list"] as const,
    list: (filters: ChangelogFilters) => [...changeLogKeys.lists(), filters] as const,
    details: () => [...changeLogKeys.all, "detail"] as const,
    detail: (id: string) => [...changeLogKeys.details(), id] as const,
};

export function useChangeLogs(filters?: ChangelogFilters) {
    return useQuery({
        queryKey: changeLogKeys.list(filters || {}),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.search) params.append("search", filters.search);
            if (filters?.type) params.append("type", filters.type);
            if (filters?.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());

            const { data } = await apiClient.get<{ data: Changelog[]; totalCount: number }>(`/change-logs?${params.toString()}`);
            return data;
        },
    });
}

export function useCreateChangeLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateChangelogPayload) => {
            const { data } = await apiClient.post<{ success: boolean; data: Changelog }>("/change-logs", payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: changeLogKeys.lists() });
        },
    });
}

export function useUpdateChangeLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: UpdateChangelogPayload }) => {
            const { data } = await apiClient.patch<{ success: boolean; data: Changelog }>(`/change-logs/${id}`, payload);
            return data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: changeLogKeys.lists() });
            queryClient.invalidateQueries({ queryKey: changeLogKeys.detail(variables.id) });
        },
    });
}

export function useDeleteChangeLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.delete<{ success: boolean }>(`/change-logs/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: changeLogKeys.lists() });
        },
    });
}
