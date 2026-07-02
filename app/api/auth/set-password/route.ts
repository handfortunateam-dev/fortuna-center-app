/**
 * POST /api/auth/set-password
 *
 * Bootstrap endpoint to set (or reset) a user's local database password
 * using bcryptjs. Intended for admins who need to set local passwords
 * while Clerk auth is still active, or to recover from a situation where
 * the local DB password is wrong/null.
 *
 * SECURITY:
 *   - Protected by SETUP_SECRET env var (Bearer token in Authorization header)
 *   - Add SETUP_SECRET=<random_string> to .env.local
 *   - Remove or rotate this secret after use if desired
 *
 * Usage (via curl or any HTTP client):
 *   POST http://localhost:3000/api/auth/set-password
 *   Authorization: Bearer <SETUP_SECRET>
 *   Content-Type: application/json
 *   { "email": "you@example.com", "newPassword": "YourNewPassword123!" }
 *
 * Or via browser fetch in devtools console:
 *   fetch('/api/auth/set-password', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_SECRET' },
 *     body: JSON.stringify({ email: 'you@example.com', newPassword: 'YourNewPassword123!' })
 *   }).then(r => r.json()).then(console.log)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users.schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
    // ── Auth check via SETUP_SECRET ──────────────────────────────────────────
    const secret = process.env.SETUP_SECRET;
    if (!secret) {
        return NextResponse.json(
            { success: false, message: "SETUP_SECRET is not configured in .env.local" },
            { status: 500 },
        );
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (token !== secret) {
        return NextResponse.json(
            { success: false, message: "Unauthorized — invalid or missing SETUP_SECRET" },
            { status: 401 },
        );
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let email: string, newPassword: string;
    try {
        const body = await req.json();
        email = body.email?.trim();
        newPassword = body.newPassword;
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status: 400 },
        );
    }

    if (!email || !newPassword) {
        return NextResponse.json(
            { success: false, message: "Both 'email' and 'newPassword' are required" },
            { status: 400 },
        );
    }

    if (newPassword.length < 8) {
        return NextResponse.json(
            { success: false, message: "Password must be at least 8 characters" },
            { status: 400 },
        );
    }

    // ── Find user ──────────────────────────────────────────────────────────────
    const existing = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existing.length === 0) {
        return NextResponse.json(
            { success: false, message: `No user found with email: ${email}` },
            { status: 404 },
        );
    }

    // ── Hash and save ─────────────────────────────────────────────────────────
    const hashedPassword = await hash(newPassword, 10);

    await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));

    return NextResponse.json({
        success: true,
        message: `Password updated for ${email}. You can now login via local auth.`,
        user: {
            id: existing[0].id,
            email: existing[0].email,
            name: existing[0].name,
        },
    });
}
