export interface PaymentInfo {
    id: string;
    status: "paid" | "unpaid";
    amount: number;
    paidAt: string | null;
}

export interface StudentPaymentInfo {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    payment: PaymentInfo | null;
}

export interface ClassSummary {
    id: string;
    name: string;
    code: string;
    students: StudentPaymentInfo[];
}
