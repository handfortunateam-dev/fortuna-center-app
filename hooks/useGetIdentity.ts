"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import axios from "axios";

export interface IdentityResponse {
    id: string;
    clerkId: string | null;
    email: string | null;
    name: string;
    image: string | null;
    role: string;
}

const fetchIdentity = async (): Promise<IdentityResponse | null> => {
    try {
        const { data } = await apiClient.get<{ success: boolean; data: IdentityResponse }>("/auth/me");
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            return null;
        }
        console.error("Failed to fetch user identity:", err);
        throw err;
    }
};

export function useGetIdentity() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["identity"],
        queryFn: fetchIdentity,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        retry: false,
        refetchOnWindowFocus: false,
    });

    return { user: data ?? null, loading: isLoading, error, refetch };
}
