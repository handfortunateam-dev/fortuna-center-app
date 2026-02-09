
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { teacherClasses } from "@/db/schema/teacher-class.schema";
import { classEnrollments } from "@/db/schema/class-enrollment.schema";
import { eq } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if ID is a UUID (database ID) or Clerk ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isUUID) {
            // Fetch from database by UUID
            const user = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (!user || user.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    { status: 404 }
                );
            }

            const userData = user[0];
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        clerkId: userData.clerkId,
                        image: userData.image,
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt,
                    },
                },
                { status: 200 }
            );
        }

        // Original Clerk ID flow
        const client = await clerkClient();

        try {
            const user = await client.users.getUser(id);

            const transformedUser = {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress || null,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastSignInAt: user.lastSignInAt,
                emailVerified: user.emailAddresses[0]?.verification?.status === "verified",
                phoneNumbers: user.phoneNumbers.map(p => ({
                    phoneNumber: p.phoneNumber,
                    verified: p.verification?.status === "verified"
                })),
                externalAccounts: user.externalAccounts.map(e => ({
                    provider: e.provider,
                    emailAddress: e.emailAddress
                }))
            };

            return NextResponse.json(
                {
                    success: true,
                    data: transformedUser,
                    message: "User fetched successfully",
                },
                { status: 200 }
            );
        } catch (e) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch user",
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
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const adminCheck = await isAdmin();
        if (!adminCheck) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const client = await clerkClient();

        // Delete from Clerk
        try {
            await client.users.deleteUser(id);
        } catch (error: any) {
            // Ignore if user not found (404) in Clerk, as we still want to delete from our DB
            if (error.status === 404) {
                console.warn(`User ${id} not found in Clerk, proceeding to delete from local DB.`);
            } else {
                throw error;
            }
        }

        // Delete from DB
        // First get the user's UUID
        const userInDb = await db.query.users.findFirst({
            where: eq(users.clerkId, id)
        });

        if (userInDb) {
            // Delete related records manually to avoid FK constraint errors if cascade isn't set
            // 1. Delete from teacher_classes
            await db.delete(teacherClasses).where(eq(teacherClasses.teacherId, userInDb.id));

            // 2. Delete from class_enrollments
            await db.delete(classEnrollments).where(eq(classEnrollments.studentId, userInDb.id));

            // Proceed to delete user
            await db.delete(users).where(eq(users.id, userInDb.id));
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to delete user",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const adminCheck = await isAdmin();
        if (!adminCheck) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check if ID is a UUID (database ID) or Clerk ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isUUID) {
            // Update database user directly
            const updateData: { name?: string; email?: string } = {};
            if (body.name) updateData.name = body.name;
            if (body.email) updateData.email = body.email;

            const updatedUser = await db.update(users)
                .set(updateData)
                .where(eq(users.id, id))
                .returning();

            if (!updatedUser || updatedUser.length === 0) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: "User updated successfully",
                data: updatedUser[0]
            }, { status: 200 });
        }

        // Original Clerk ID flow
        const client = await clerkClient();

        // Update Clerk User
        const updateParams: Parameters<typeof client.users.updateUser>[1] = {};
        if (body.firstName) updateParams.firstName = body.firstName;
        if (body.lastName) updateParams.lastName = body.lastName;

        // Note: Changing email or password usually requires different flows or permissions in Clerk, 
        // passing them directly to updateUser might work depending on instance settings or return errors.
        // For simplicity we update basic profile info.

        const updatedClerkUser = await client.users.updateUser(id, updateParams);

        // Update DB User (if name changed)
        if (body.firstName || body.lastName) {
            await db.update(users)
                .set({
                    name: `${updatedClerkUser.firstName || ""} ${updatedClerkUser.lastName || ""}`.trim(),
                    // Update other fields if synced
                })
                .where(eq(users.clerkId, id));
        }

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            data: updatedClerkUser
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to update user",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
