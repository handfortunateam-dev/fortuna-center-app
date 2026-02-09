export interface MenuItem {
    key: string;
    label: string;
    route?: string;
    icon?: string | React.ComponentType<{ className?: string }> | React.ReactNode;
    children?: MenuItem[];
}

export const RESOURCES: MenuItem[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        route: "/",
        icon: "solar:home-smile-bold",
    },
    {
        key: "users",
        label: "Users",
        route: "/users",
        icon: "solar:users-group-rounded-bold",
    },
    {
        key: "settings",
        label: "Settings",
        route: "/settings",
        icon: "solar:settings-bold",
    },
];
