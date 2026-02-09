import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { IStudent } from "@/features/lms/students/interface";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [student] = await db
            .select()
            .from(students)
            .where(eq(students.id, id))
            .limit(1);

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: student });
    } catch (error) {
        console.error("Error fetching student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch student",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { firstName, lastName, email, phone, address, userId } = body;

        // Check if student exists
        const [existingStudent] = await db
            .select()
            .from(students)
            .where(eq(students.id, id))
            .limit(1);

        if (!existingStudent) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        // Check for email duplicates if email is being updated
        if (email && email !== existingStudent.email) {
            const [duplicate] = await db
                .select()
                .from(students)
                .where(eq(students.email, email))
                .limit(1);

            if (duplicate) {
                return NextResponse.json(
                    { success: false, message: "Email already in use" },
                    { status: 409 }
                );
            }
        }

        // Check for userId duplicates if userId is being updated
        if (userId && userId !== existingStudent.userId) {
            const [duplicateUser] = await db
                .select()
                .from(students)
                .where(eq(students.userId, userId))
                .limit(1);

            if (duplicateUser) {
                return NextResponse.json(
                    { success: false, message: "User is already associated with another student" },
                    { status: 409 }
                );
            }
        }

        const [updatedStudent] = await db
            .update(students)
            .set({
                firstName,
                lastName,
                email,
                phone,
                address,
                userId,
                updatedAt: new Date(),
            })
            .where(eq(students.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedStudent,
            message: "Student updated successfully",
        });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update student",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Optional: Check if student has related data (e.g. enrollments) that prevents deletion
        // For now, standard delete

        const [deletedStudent] = await db
            .delete(students)
            .where(eq(students.id, id))
            .returning();

        if (!deletedStudent) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete student",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
