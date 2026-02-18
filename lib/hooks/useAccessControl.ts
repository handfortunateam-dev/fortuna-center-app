import { MenuItem } from "@/constants/resource";
import { getNavigationByRole, AdminNavigationItem } from "@/config/navigationItem";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api";
import { AuthUser } from "@/lib/auth/getAuthUser";

export function useAccessControl() {
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

    const rawMenuItems = getNavigationByRole(role);

    // Map AdminNavigationItem to MenuItem
    const mapToMenuItem = (item: AdminNavigationItem, index: number, prefix: string = ''): MenuItem => {
        const uniqueKey = item.href || `${prefix}${item.name}-${index}`;
        return {
            key: uniqueKey,
            label: item.name,
            route: item.href,
            icon: item.icon as any,
            children: item.children?.map((child, childIndex) => mapToMenuItem(child, childIndex, `${uniqueKey}-`))
        };
    };

    const menuItems: MenuItem[] = rawMenuItems.map((item, index) => mapToMenuItem(item, index));

    return {
        userName,
        userEmail,
        role,
        isAdmin,
        isLoading,
        menuItems: menuItems,
    };
}
