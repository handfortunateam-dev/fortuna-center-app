import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = nanoid();

        await db.insert(users).values({
            // @ts-ignore - id is handled by helper or we provide it
            name,
            email,
            password: hashedPassword,
            role: "ADMINISTRATIVE_EMPLOYEE", // Default role as requested
            clerkId: `local_${userId}`, // Dummy Clerk ID to satisfy unique constraint
        });

        return NextResponse.json({ success: true, message: "User created" });

    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
