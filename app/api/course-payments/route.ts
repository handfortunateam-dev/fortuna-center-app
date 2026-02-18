import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coursePayments, users, classes } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get("studentId");
        const classId = searchParams.get("classId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const status = searchParams.get("status");

        const filters = [];
        if (studentId) filters.push(eq(coursePayments.studentId, studentId));
        if (classId) filters.push(eq(coursePayments.classId, classId));
        if (month) filters.push(eq(coursePayments.month, parseInt(month)));
        if (year) filters.push(eq(coursePayments.year, parseInt(year)));
        if (status) filters.push(eq(coursePayments.status, status as "paid" | "unpaid"));

        const where = filters.length ? and(...filters) : undefined;

        const data = await db.query.coursePayments.findMany({
            where,
            with: {
                student: true,
                class: true,
                recorder: true, // recordedBy user
            },
            orderBy: [desc(coursePayments.updatedAt)],
            limit: 100, // Limit for now
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching course payments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch course payments",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get internal user ID from clerk ID
        const [currentUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 },
            );
        }

        const body = await request.json();
        const {
            studentId,
            classId,
            month,
            year,
            amount,
            status = "unpaid",
            paidAt,
            notes,
        } = body;

        // Basic validation
        if (!studentId || !classId || !month || !year || !amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: studentId, classId, month, year, amount",
                },
                { status: 400 },
            );
        }

        // Check for existing payment for same period
        const existingPayment = await db.query.coursePayments.findFirst({
            where: and(
                eq(coursePayments.studentId, studentId),
                eq(coursePayments.classId, classId),
                eq(coursePayments.month, month),
                eq(coursePayments.year, year),
            ),
        });

        if (existingPayment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment record for this period already exists",
                },
                { status: 409 },
            );
        }

        const [newPayment] = await db
            .insert(coursePayments)
            .values({
                studentId,
                classId,
                month,
                year,
                amount,
                status,
                paidAt: paidAt || null,
                notes: notes || null,
                recordedBy: currentUser.id,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: newPayment,
                message: "Course payment created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating course payment:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create course payment",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
