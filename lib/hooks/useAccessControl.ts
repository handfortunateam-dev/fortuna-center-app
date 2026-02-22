import { MenuItem } from "@/constants/resource";
import { getNavigationByRole, AdminNavigationItem } from "@/config/navigationItem";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import { AuthUser } from "@/lib/auth/getAuthUser";

export function useAccessControl() {
    const router = useRouter();
    const { data: user, isLoading } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
            return data.data; // This is the AuthUser object
        },
        retry: 1,
        staleTime: 30 * 60 * 1000, // 30 minutes - data stays fresh for 30 min
        gcTime: 60 * 60 * 1000, // 1 hour - keep in cache for 1 hour even when unused
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
    });

    const role = user?.role || "";
    const userName = user?.name || "";
    const userEmail = user?.email || "";
    const isAdmin = role === "ADMIN";

    // Manage multi-role view state
    const [currentView, setCurrentView] = useState<"admin" | "teacher">(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("multiRoleView");
            if (stored === "admin" || stored === "teacher") {
                return stored;
            }
        }
        return "teacher";
    });

    // Sync localStorage value to cookie on mount so the server component can read it
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("multiRoleView");
            if (stored === "admin" || stored === "teacher") {
                document.cookie = `multiRoleView=${stored}; path=/; max-age=${60 * 60 * 24 * 30}`;
            }
        }
    }, []);

    const [isSwitching, setIsSwitching] = useState(false);

    const toggleView = () => {
        setIsSwitching(true);
        const nextView = currentView === "teacher" ? "admin" : "teacher";

        // Update state locally first
        setCurrentView(nextView);

        if (typeof window !== "undefined") {
            localStorage.setItem("multiRoleView", nextView);
            document.cookie = `multiRoleView=${nextView}; path=/; max-age=${60 * 60 * 24 * 30}`;
        }

        // Trigger refresh and then reset loading state after a delay
        router.refresh();

        // Fallback to hide loading screen if router.refresh is fast
        // or if the component doesn't unmount
        setTimeout(() => {
            setIsSwitching(false);
        }, 800);
    };

    const rawMenuItems = getNavigationByRole(
        role,
        user?.isAdminEmployeeAlso,
        currentView
    );

    // Map AdminNavigationItem to MenuItem
    const mapToMenuItem = (item: AdminNavigationItem, index: number, prefix: string = ''): MenuItem => {
        const uniqueKey = item.href || `${prefix}${item.name}-${index}`;
        return {
            key: uniqueKey,
            label: item.name,
            route: item.href,
            icon: item.icon as unknown as React.ReactNode,
            children: item.children?.map((child, childIndex) => mapToMenuItem(child, childIndex, `${uniqueKey}-`))
        };
    };

    const menuItems: MenuItem[] = rawMenuItems.map((item, index) => mapToMenuItem(item, index));

    return {
        user,
        userName,
        userEmail,
        role,
        isAdmin,
        isLoading,
        menuItems: menuItems,
        currentView,
        toggleView,
        isSwitching,
    };
}
