import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = (body.email ?? "").trim().toLowerCase();
        const password = (body.password ?? "").trim();

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

        // ── Set session cookie ────────────────────────────────────────────────
        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, role: user.role, email: user.email },
        });

        // HttpOnly so JS can't read it (XSS safe), Secure in production
        response.cookies.set("local_session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error: unknown) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

