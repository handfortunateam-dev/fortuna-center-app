import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, coursePayments } from "@/db/schema";
import { getMonth, getYear } from "date-fns";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const month = parseInt(
            searchParams.get("month") || String(getMonth(new Date()) + 1),
        );
        const year = parseInt(
            searchParams.get("year") || String(getYear(new Date())),
        );
        const searchQuery = searchParams.get("search") || "";

        // 1. Get all active classes
        const activeClasses = await db.query.classes.findMany({
            where: eq(classes.isActive, true),
            with: {
                enrollments: {
                    with: {
                        student: {
                            with: {
                                user: true, // Join with detailed user profile if any
                            }
                        },
                    },
                },
            },
            orderBy: (classes, { asc }) => [asc(classes.name)],
        });

        // 2. Get all payments for the specific month/year
        const payments = await db.query.coursePayments.findMany({
            where: and(
                eq(coursePayments.month, month),
                eq(coursePayments.year, year),
            ),
        });

        // 3. Transform and Merge Data
        const result = activeClasses.map((cls) => {
            // Filter enrollments based on search query (student name)
            const filteredEnrollments = cls.enrollments.filter((enrollment) => {
                const studentProfile = enrollment.student;
                if (!studentProfile) return false;

                if (!searchQuery) return true;

                const fullName = `${studentProfile.firstName} ${studentProfile.lastName}`.trim();
                return fullName.toLowerCase().includes(searchQuery.toLowerCase());
            });

            // Prepare students with payment status
            const students = filteredEnrollments.map((enrollment) => {
                const studentProfile = enrollment.student;

                // Find existing payment record for this student/class/period
                const payment = payments.find(
                    (p) => p.studentId === studentProfile.id && p.classId === cls.id,
                );

                return {
                    id: studentProfile.id, // Student UUID linked to payment
                    studentId: studentProfile.studentId || "-", // Student Reg ID (e.g. "S2024001")
                    name: `${studentProfile.firstName} ${studentProfile.lastName}`.trim(),
                    email: studentProfile.email || studentProfile.user?.email || "-",
                    phone: studentProfile.phone || "-",
                    gender: studentProfile.gender || "-",
                    payment: payment
                        ? {
                            id: payment.id,
                            status: payment.status,
                            amount: payment.amount,
                            paidAt: payment.paidAt,
                        }
                        : null, // No payment = Unpaid
                };
            });

            return {
                id: cls.id,
                name: cls.name,
                code: cls.code,
                students,
            };
        });

        // Filter out classes with no matching students if search is active
        const filteredResult = searchQuery
            ? result.filter((cls) => cls.students.length > 0)
            : result;

        return NextResponse.json({
            success: true,
            data: filteredResult,
        });
    } catch (error) {
        console.error("Error fetching payment summary:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch payment summary",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
