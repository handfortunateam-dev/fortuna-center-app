import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || searchParams.get("query") || "";
        const userId = searchParams.get("userId") || "";

        const filters = [];
        if (query) {
            const dbQuery = `%${query}%`;
            filters.push(
                or(
                    ilike(teachers.firstName, dbQuery),
                    ilike(teachers.lastName, dbQuery),
                    ilike(teachers.email, dbQuery)
                )
            );
        }
        if (userId) {
            filters.push(eq(teachers.userId, userId));
        }

        const where = filters.length ? and(...filters) : undefined;

        const data = await db
            .select()
            .from(teachers)
            .where(where)
            .orderBy(desc(teachers.createdAt));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch teachers",
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
        const {
            firstName,
            middleName,
            lastName,
            gender,
            placeOfBirth,
            dateOfBirth,
            email,
            phone,
            address,
            education,
            userId
        } = body;

        // Validation
        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: firstName, lastName, email" },
                { status: 400 }
            );
        }

        // Check for duplicate email
        const [existingEmail] = await db
            .select()
            .from(teachers)
            .where(eq(teachers.email, email))
            .limit(1);

        if (existingEmail) {
            return NextResponse.json(
                { success: false, message: "Teacher with this email already exists" },
                { status: 409 }
            );
        }

        // Check for duplicate userId association if provided
        if (userId) {
            const [existingUser] = await db
                .select()
                .from(teachers)
                .where(eq(teachers.userId, userId))
                .limit(1);

            if (existingUser) {
                return NextResponse.json(
                    { success: false, message: "User is already associated with another teacher" },
                    { status: 409 }
                );
            }
        }

        const [newTeacher] = await db
            .insert(teachers)
            .values({
                firstName,
                middleName: middleName || null,
                lastName,
                gender: gender || null,
                placeOfBirth: placeOfBirth || null,
                dateOfBirth: dateOfBirth || null,
                email,
                phone: phone || null,
                address: address || null,
                education: education || null,
                userId: userId || null,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: newTeacher,
                message: "Teacher created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating teacher:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create teacher",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
