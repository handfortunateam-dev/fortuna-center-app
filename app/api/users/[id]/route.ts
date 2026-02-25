
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { teacherClasses } from "@/db/schema/teacher-class.schema";
import { classEnrollments } from "@/db/schema/class-enrollment.schema";
import { students } from "@/db/schema/students.schema";
import { assignmentSubmissions } from "@/db/schema/assignment-submission.schema";
import { posts } from "@/db/schema/posts.schema";
import { postComments } from "@/db/schema/post-comment.schema";
import { eq } from "drizzle-orm";
import { UserRole } from "@/enums/common";

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
                        firstName: userData.name.split(" ")[0] || "",
                        lastName: userData.name.split(" ").slice(1).join(" ") || "",
                        role: userData.role,
                        isAdminEmployeeAlso: userData.isAdminEmployeeAlso,
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

            // 1. Unlink from students (set userId to null)
            await db.update(students)
                .set({ userId: null })
                .where(eq(students.userId, userInDb.id));

            // 2. Delete assignment submissions by this student
            await db.delete(assignmentSubmissions).where(eq(assignmentSubmissions.studentId, userInDb.id));

            // 3. Set gradedBy to null for submissions graded by this user
            await db.update(assignmentSubmissions)
                .set({ gradedBy: null })
                .where(eq(assignmentSubmissions.gradedBy, userInDb.id));

            // 4. Delete posts by this author
            // Note: This might fail if posts have comments/likes, so we delete comments first
            await db.delete(postComments).where(eq(postComments.authorId, userInDb.id));
            await db.delete(posts).where(eq(posts.authorId, userInDb.id));

            // 5. Delete from teacher_classes
            await db.delete(teacherClasses).where(eq(teacherClasses.teacherId, userInDb.id));

            // 6. Delete from class_enrollments
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
            // Fetch the user from DB first to get clerkId
            const userInDb = await db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (!userInDb || userInDb.length === 0) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }

            const dbUser = userInDb[0];

            // Update Clerk if clerkId exists
            if (dbUser.clerkId) {
                const client = await clerkClient();
                const clerkUpdateParams: Parameters<typeof client.users.updateUser>[1] = {};
                if (body.firstName !== undefined) clerkUpdateParams.firstName = body.firstName;
                if (body.lastName !== undefined) clerkUpdateParams.lastName = body.lastName;
                if (body.password) clerkUpdateParams.password = body.password;

                if (Object.keys(clerkUpdateParams).length > 0) {
                    await client.users.updateUser(dbUser.clerkId, clerkUpdateParams);
                }
            }

            // Build DB update — form sends firstName + lastName, not name
            const updateData: { name?: string; email?: string; role?: UserRole; isAdminEmployeeAlso?: boolean; password?: string } = {};
            if (body.firstName !== undefined || body.lastName !== undefined) {
                updateData.name = `${body.firstName || ""} ${body.lastName || ""}`.trim();
            }
            if (body.email) updateData.email = body.email;
            if (body.role !== undefined) updateData.role = body.role;
            if (body.isAdminEmployeeAlso !== undefined) updateData.isAdminEmployeeAlso = body.isAdminEmployeeAlso;
            if (body.password) {
                const bcrypt = await import("bcryptjs");
                updateData.password = await bcrypt.hash(body.password, 10);
            }

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
        if (body.password) updateParams.password = body.password;

        const updatedClerkUser = await client.users.updateUser(id, updateParams);

        // Update DB User (if name or password or roles changed)
        if (
            body.firstName ||
            body.lastName ||
            body.password ||
            body.role !== undefined ||
            body.isAdminEmployeeAlso !== undefined
        ) {
            const dbUpdateData: any = {};

            if (body.firstName || body.lastName) {
                dbUpdateData.name = `${updatedClerkUser.firstName || ""} ${updatedClerkUser.lastName || ""}`.trim();
            }

            if (body.password) {
                const bcrypt = await import("bcryptjs");
                dbUpdateData.password = await bcrypt.hash(body.password, 10);
            }

            if (body.role !== undefined) {
                dbUpdateData.role = body.role;
            }

            if (body.isAdminEmployeeAlso !== undefined) {
                dbUpdateData.isAdminEmployeeAlso = body.isAdminEmployeeAlso;
            }

            await db.update(users)
                .set(dbUpdateData)
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
