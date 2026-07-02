import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [teacher] = await db
            .select()
            .from(teachers)
            .where(eq(teachers.id, id))
            .limit(1);

        if (!teacher) {
            return NextResponse.json(
                { success: false, message: "Teacher not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: teacher });
    } catch (error) {
        console.error("Error fetching teacher:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch teacher",
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
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
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

        // Check if teacher exists
        const [existingTeacher] = await db
            .select()
            .from(teachers)
            .where(eq(teachers.id, id))
            .limit(1);

        if (!existingTeacher) {
            return NextResponse.json(
                { success: false, message: "Teacher not found" },
                { status: 404 }
            );
        }

        // Check for email duplicates if email is being updated
        if (email && email !== existingTeacher.email) {
            const [duplicate] = await db
                .select()
                .from(teachers)
                .where(eq(teachers.email, email))
                .limit(1);

            if (duplicate) {
                return NextResponse.json(
                    { success: false, message: "Email already in use" },
                    { status: 409 }
                );
            }
        }

        // Check for userId duplicates if userId is being updated
        if (userId && userId !== existingTeacher.userId) {
            const [duplicateUser] = await db
                .select()
                .from(teachers)
                .where(eq(teachers.userId, userId))
                .limit(1);

            if (duplicateUser) {
                return NextResponse.json(
                    { success: false, message: "User is already associated with another teacher" },
                    { status: 409 }
                );
            }
        }

        const [updatedTeacher] = await db
            .update(teachers)
            .set({
                ...(firstName !== undefined && { firstName }),
                ...(middleName !== undefined && { middleName }),
                ...(lastName !== undefined && { lastName }),
                ...(gender !== undefined && { gender }),
                ...(placeOfBirth !== undefined && { placeOfBirth }),
                ...(dateOfBirth !== undefined && { dateOfBirth }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(education !== undefined && { education }),
                ...(userId !== undefined && { userId }),
                updatedAt: new Date(),
            })
            .where(eq(teachers.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedTeacher,
            message: "Teacher updated successfully",
        });
    } catch (error) {
        console.error("Error updating teacher:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update teacher",
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
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const [deletedTeacher] = await db
            .delete(teachers)
            .where(eq(teachers.id, id))
            .returning();

        if (!deletedTeacher) {
            return NextResponse.json(
                { success: false, message: "Teacher not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Teacher deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting teacher:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete teacher",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
