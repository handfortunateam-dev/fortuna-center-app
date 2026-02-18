import { useQuery } from "@tanstack/react-query";

export interface PublicConfig {
    auth_provider: string; // "clerk" | "local" | "none"
    maintenance_mode: boolean;
    [key: string]: any;
}

const fetchConfig = async (): Promise<PublicConfig> => {
    const res = await fetch("/api/public/config");
    const json = await res.json();

    if (!json.success || !json.data) {
        throw new Error("Failed to load configuration");
    }

    const data = json.data;

    // Safe unwrap for auth_provider which might be double-serialized
    let authProvider = data.auth_provider;
    if (typeof authProvider === 'string' && (authProvider.startsWith('"') || authProvider.startsWith("'"))) {
        try { authProvider = JSON.parse(authProvider); } catch { }
    }

    return {
        ...data,
        auth_provider: authProvider || "clerk",
        // Ensure maintenance_mode is boolean if needed, though API should handle it
    };
};

export function usePublicConfig() {
    return useQuery({
        queryKey: ["public-config"],
        queryFn: fetchConfig,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1,
        refetchOnWindowFocus: false, // Don't refetch on window focus to avoid screen flickering
    });
}
