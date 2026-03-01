export const TICKET_CATEGORIES = [
    { key: "bug", label: "Bug Report" },
    { key: "feature_request", label: "Feature Request" },
    { key: "billing", label: "Billing Issue" },
    { key: "other", label: "Other Support" },
] as const;

export const TICKET_STATUSES = [
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
] as const;

export const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined> = {
    open: "warning",
    in_progress: "primary",
    resolved: "success",
    closed: "default",
};
