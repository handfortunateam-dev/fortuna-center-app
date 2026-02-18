"use client";

import { usePublicConfig } from "@/hooks/use-public-config";

export function useAuthProvider() {
    const { data: config, isLoading } = usePublicConfig();
    const authProvider = config?.auth_provider || "clerk";
    return { authProvider, isLoading };
}
