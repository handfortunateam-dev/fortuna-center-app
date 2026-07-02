import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { UserRole } from "@/enums/common";

export async function GET(req: NextRequest) {
    try {
        // ── Try Clerk auth first ──────────────────────────────────────────────
        const user = await getAuthUser();
        if (user) {
            return NextResponse.json({ success: true, data: user });
        }

        // ── Fallback: check local_session cookie (local auth mode) ────────────
        const localSessionId = req.cookies.get("local_session")?.value;
        if (localSessionId) {
            const dbUser = await db
                .select()
                .from(users)
                .where(eq(users.id, localSessionId))
                .limit(1);

            if (dbUser.length > 0) {
                const u = dbUser[0];
                return NextResponse.json({
                    success: true,
                    data: {
                        id: u.id,
                        clerkId: u.clerkId,
                        email: u.email,
                        name: u.name,
                        image: u.image,
                        role: u.role as UserRole,
                        isAdminEmployeeAlso: u.isAdminEmployeeAlso,
                    },
                });
            }
        }

        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    } catch (error) {
        console.error("Error fetching auth user:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}



export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const { name, password, email } = body;

        // ── 1. Sync to Clerk (if this user has a Clerk account) ──────────────
        if (user.clerkId) {
            try {
                const { clerkClient } = await import("@clerk/nextjs/server");
                const client = await clerkClient();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clerkUpdate: Record<string, any> = {};
                if (name) {
                    const parts = name.trim().split(" ");
                    clerkUpdate.firstName = parts[0] || "";
                    clerkUpdate.lastName = parts.slice(1).join(" ") || "";
                }
                if (password) clerkUpdate.password = password; // Clerk wants plain-text
                // Note: email change in Clerk requires verification flow — skip for now

                if (Object.keys(clerkUpdate).length > 0) {
                    await client.users.updateUser(user.clerkId, clerkUpdate);
                }
            } catch (clerkError) {
                console.error("Failed to sync password change to Clerk:", clerkError);
                // Don't fail the whole request — still update local DB below
            }
        }

        // ── 2. Update local DB ────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields to update" },
                { status: 400 },
            );
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true, message: "Profile updated successfully" });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}

