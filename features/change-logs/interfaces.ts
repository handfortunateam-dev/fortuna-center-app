export interface Changelog {
    id: string;
    title: string;
    content: string;
    type: "FEATURE" | "BUG_FIX" | "IMPROVEMENT" | "UPDATE";
    version: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string | null;
    author: {
        id: string;
        name: string | null;
        email: string;
    } | null;
}

export interface ChangelogFilters {
    search?: string;
    type?: string;
    isPublished?: boolean;
}

export interface CreateChangelogPayload {
    title: string;
    content: string;
    type: "FEATURE" | "BUG_FIX" | "IMPROVEMENT" | "UPDATE";
    version: string;
    isPublished: boolean;
}

export interface UpdateChangelogPayload extends Partial<CreateChangelogPayload> { }
