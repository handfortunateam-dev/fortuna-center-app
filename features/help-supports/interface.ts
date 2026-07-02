export interface ITicket {
    id: string;
    userId: string;
    subject: string;
    category: "bug" | "feature_request" | "billing" | "other";
    description: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    adminResponse: string | null;
    assignedTo: string | null;
    resolvedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface ICreateTicketPayload {
    subject: string;
    category: "bug" | "feature_request" | "billing" | "other" | string;
    description: string;
}

export interface IUpdateTicketPayload {
    status?: "open" | "in_progress" | "resolved" | "closed" | string;
    adminResponse?: string;
}
