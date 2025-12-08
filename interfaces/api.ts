export interface QueryParams {
    limit?: number;
    offset?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}


export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}