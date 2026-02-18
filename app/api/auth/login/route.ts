import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: "Missing email or password" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json({ success: false, message: "User is registered with external provider" }, { status: 400 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

        // TODO: Issue session cookie or JWT here
        // For now, simple success response
        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });

    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
