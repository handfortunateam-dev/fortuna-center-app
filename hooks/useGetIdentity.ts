"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";

export interface IdentityResponse {
    id: string;
    clerkId: string | null;
    email: string | null;
    name: string;
    image: string | null;
    role: string;
}

export function useGetIdentity() {
    const [user, setUser] = useState<IdentityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchIdentity = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get<{ success: boolean; data: IdentityResponse }>("/auth/me");
            if (data.success) {
                setUser(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch user identity:", err);
            setError(err instanceof Error ? err : new Error("Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIdentity();
    }, []);

    return { user, loading, error, refetch: fetchIdentity };
}
