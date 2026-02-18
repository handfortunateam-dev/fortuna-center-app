import { BaseEntity } from "@/interfaces/api";

export interface ITeacher extends BaseEntity {
    teacherNumber: number;
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
    userId?: string;
}

export interface TeacherFormValues {
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
    userId?: string;
}

export interface TeacherListParams {
    q?: string;
}
