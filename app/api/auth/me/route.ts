import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
// @ts-expect-error
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching auth user:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, password, email } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields to update" },
                { status: 400 }
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
            { status: 500 }
        );
    }
}
