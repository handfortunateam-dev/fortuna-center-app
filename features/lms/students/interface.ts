import { BaseEntity } from "@/interfaces/api";

export interface IStudent extends BaseEntity {
    studentNumber: number;
    studentId: string;
    registrationDate: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    nickname?: string;
    gender?: "male" | "female";
    placeOfBirth?: string;
    dateOfBirth?: string;
    email?: string | null;
    phone: string;
    address?: string;
    education?: string;
    occupation?: string;
    userId?: string;
    status?: "active" | "inactive" | "on_leave";
}

export interface StudentFormValues {
    studentId?: string;
    registrationDate?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    nickname?: string;
    gender?: "male" | "female";
    placeOfBirth?: string;
    dateOfBirth?: string;
    email?: string;
    phone: string;
    address?: string;
    education?: string;
    occupation?: string;
    status?: "active" | "inactive" | "on_leave";
    userId?: string;
}

export interface StudentListParams {
    q?: string;
    limit?: number;
    page?: number;
}