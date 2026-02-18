import { BaseEntity } from "@/interfaces/api";

export interface IStudent extends BaseEntity {
    studentNumber: number;
    studentId: string;
    registrationDate: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender?: "male" | "female";
    placeOfBirth?: string;
    dateOfBirth?: string;
    email: string;
    phone?: string;
    address?: string;
    education?: string;
    occupation?: string;
    userId?: string;
}

export interface StudentFormValues {
    studentId?: string;
    registrationDate?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender?: "male" | "female";
    placeOfBirth?: string;
    dateOfBirth?: string;
    email: string;
    phone?: string;
    address?: string;
    education?: string;
    occupation?: string;
    userId?: string;
}

export interface StudentListParams {
    q?: string;
}