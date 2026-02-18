
export interface CoursePayment {
    id: string;
    studentId: string;
    classId: string;
    month: number;
    year: number;
    amount: number;
    status: "paid" | "unpaid";
    paidAt?: string | null;
    notes?: string | null;
    recordedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    student: {
        id: string;
        studentId: string;
        name: string;
        email: string;
    };
    class: {
        id: string;
        name: string;
    };
    recorder?: {
        id: string;
        name: string;
    };
}
