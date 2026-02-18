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
        const {
            studentId,
            registrationDate,
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
            occupation,
            userId
        } = body;

        // Validation
        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: firstName, lastName, email" },
                { status: 400 }
            );
        }

        // Check if studentId provided, otherwise we will generate it after insertion
        let finalStudentId = studentId;
        const tempId = `TEMP-${crypto.randomUUID()}`;

        if (!finalStudentId) {
            // We use a temporary ID first to let the DB generate the serial studentNumber
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

        // Insert with (potentially temporary) ID
        const [insertedStudent] = await db
            .insert(students)
            .values({
                studentId: finalStudentId,
                registrationDate: registrationDate || new Date().toISOString().split('T')[0],
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
                occupation: occupation || null,
                userId: userId || null,
            })
            .returning();

        let newStudent = insertedStudent;

        // If we used a temp ID, generate the real one based on the serial studentNumber
        if (!studentId && insertedStudent.studentId === tempId) {
            const year = new Date().getFullYear();
            // Format: YYYY + 4-digit Sequence (e.g. 20260001)
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
