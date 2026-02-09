import { BaseEntity } from "@/interfaces/api";

export interface IStudent extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    userId?: string;
}

export interface StudentFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    userId?: string;
}

export interface StudentListParams {
    q?: string;
}