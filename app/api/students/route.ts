import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || searchParams.get("query") || "";

        const filters = [];
        if (query) {
            const dbQuery = `%${query}%`;
            filters.push(
                or(
                    ilike(students.firstName, dbQuery),
                    ilike(students.lastName, dbQuery),
                    ilike(students.email, dbQuery)
                )
            );
        }

        const where = filters.length ? and(...filters) : undefined;

        const data = await db
            .select()
            .from(students)
            .where(where)
            .orderBy(desc(students.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch students",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, email, phone, address, userId } = body;

        // Validation
        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check for duplicate email
        const [existingEmail] = await db
            .select()
            .from(students)
            .where(eq(students.email, email))
            .limit(1);

        if (existingEmail) {
            return NextResponse.json(
                { success: false, message: "Student with this email already exists" },
                { status: 409 }
            );
        }

        // Check for duplicate userId association if provided
        if (userId) {
            const [existingUser] = await db
                .select()
                .from(students)
                .where(eq(students.userId, userId))
                .limit(1);

            if (existingUser) {
                return NextResponse.json(
                    { success: false, message: "User is already associated with another student" },
                    { status: 409 }
                );
            }
        }

        const [newStudent] = await db
            .insert(students)
            .values({
                firstName,
                lastName,
                email,
                phone,
                address,
                userId: userId || null,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: newStudent,
                message: "Student created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create student",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
