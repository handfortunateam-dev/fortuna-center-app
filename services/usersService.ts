"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import {
  ClerkUser,
  ClerkUserDetail,
  UsersListParams,
} from "@/features/users/interfaces";

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: UsersListParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// ==================== API FUNCTIONS (using Axios) ====================

// Fetch all users from Clerk
async function getUsers(
  params?: UsersListParams
): Promise<ApiResponse<ClerkUser[]> & { totalCount?: number }> {
  const { data } = await apiClient.get<
    ApiResponse<ClerkUser[]> & { totalCount?: number }
  >("/users", {
    params,
  });
  return data;
}

// Fetch single user from Clerk
async function getUser(id: string): Promise<ApiResponse<ClerkUserDetail>> {
  const { data } = await apiClient.get<ApiResponse<ClerkUserDetail>>(
    `/users/${id}`
  );
  return data;
}

// ==================== REACT QUERY HOOKS ====================

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!id, // Only run if id exists
  });
}