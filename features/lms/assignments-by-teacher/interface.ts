import { BaseEntity } from "@/interfaces/api";

export type AssignmentStatus = "draft" | "published" | "closed";

export interface IAssignment extends BaseEntity {
    title: string;
    description?: string;
    instructions?: string;
    classId: string;
    className?: string; // For display
    teacherId: string;
    teacherName?: string; // For display
    status: AssignmentStatus;
    maxScore?: number;
    dueDate?: string; // ISO date string
    attachments?: {
        url: string;
        type: 'image' | 'video' | 'document' | 'audio';
        name: string;
    }[];
}

export interface AssignmentFormValues {
    title: string;
    description?: string;
    instructions?: string;
    classId: string;
    // teacherId is usually inferred from the authenticated session or passed if admin
    maxScore: number;
    dueDate: string; // ISO date string
    attachments?: {
        url: string;
        type: 'image' | 'video' | 'document' | 'audio';
        name: string;
        file?: File; // For pending uploads
        previewUrl?: string; // For local preview
    }[];
    status?: AssignmentStatus;
}

export interface AssignmentListParams {
    q?: string;
    classId?: string;
    teacherId?: string;
    status?: AssignmentStatus;
}
