export interface QueryParams {
    limit?: number;
    offset?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    totalCount?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
    error?: string;
}


export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}