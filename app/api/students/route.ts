import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || searchParams.get("query") || "";
        const limit = Math.max(1, Number(searchParams.get("limit") || 10));
        const page = Math.max(1, Number(searchParams.get("page") || 1));
        const offset = searchParams.get("offset")
            ? Number(searchParams.get("offset"))
            : (page - 1) * limit;

        const filters = [];
        if (query) {
            const dbQuery = `%${query}%`;
            filters.push(
                or(
                    ilike(students.firstName, dbQuery),
                    ilike(students.lastName, dbQuery),
                    ilike(students.email, dbQuery),
                    ilike(students.nickname, dbQuery),
                    ilike(students.phone, dbQuery),
                )
            );
        }

        // Add dynamic filters from query params (e.g., ?gender=male)
        searchParams.forEach((value, key) => {
            if (!["q", "query", "limit", "page", "offset"].includes(key) && value) {
                if (key === "year") {
                    // Special handling for registration year
                    filters.push(sql`EXTRACT(YEAR FROM ${students.registrationDate}) = ${parseInt(value)}`);
                    return;
                }

                const column = (students as unknown as Record<string, unknown>)[key];
                if (column) {
                    filters.push(eq(column, value));
                }
            }
        });

        const where = filters.length ? and(...filters) : undefined;

        // Run count and data queries in parallel
        const [countResult, data] = await Promise.all([
            db.select({ total: count() }).from(students).where(where),
            db
                .select()
                .from(students)
                .where(where)
                .orderBy(desc(students.createdAt))
                .limit(limit)
                .offset(offset),
        ]);

        const totalCount = countResult[0]?.total ?? 0;
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data,
            totalCount,
            page,
            limit,
            totalPages,
        });
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
        const {
            studentId,
            registrationDate,
            firstName,
            middleName,
            lastName,
            nickname,
            gender,
            placeOfBirth,
            dateOfBirth,
            email,
            phone,
            address,
            education,
            occupation,
            userId,
        } = body;

        // Required: firstName and phone — email is optional
        if (!firstName || !phone) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: firstName, phone" },
                { status: 400 }
            );
        }

        // Generate or validate studentId
        let finalStudentId = studentId;
        const tempId = `TEMP-${crypto.randomUUID()}`;
        if (!finalStudentId) {
            finalStudentId = tempId;
        }

        // Check for duplicate studentId if manually provided
        if (studentId) {
            const [existingStudentId] = await db
                .select()
                .from(students)
                .where(eq(students.studentId, studentId))
                .limit(1);

            if (existingStudentId) {
                return NextResponse.json(
                    { success: false, message: "Student ID already exists" },
                    { status: 409 }
                );
            }
        }

        // Check for duplicate email — only if email is provided
        if (email) {
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

        const [insertedStudent] = await db
            .insert(students)
            .values({
                studentId: finalStudentId,
                registrationDate: registrationDate || new Date().toISOString().split("T")[0],
                firstName,
                middleName: middleName || null,
                lastName: lastName || "",
                nickname: nickname || null,
                gender: gender || null,
                placeOfBirth: placeOfBirth || null,
                dateOfBirth: dateOfBirth || null,
                email: email || null,
                phone,
                address: address || null,
                education: education || null,
                occupation: occupation || null,
                userId: userId || null,
            })
            .returning();

        let newStudent = insertedStudent;

        // Replace temp ID with a proper one based on the auto-increment studentNumber
        if (!studentId && insertedStudent.studentId === tempId) {
            const year = new Date().getFullYear();
            const sequence = String(insertedStudent.studentNumber).padStart(4, "0");
            const generatedId = `${year}${sequence}`;

            const [updatedStudent] = await db
                .update(students)
                .set({ studentId: generatedId })
                .where(eq(students.id, insertedStudent.id))
                .returning();

            newStudent = updatedStudent;
        }

        return NextResponse.json(
            { success: true, data: newStudent, message: "Student created successfully" },
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
