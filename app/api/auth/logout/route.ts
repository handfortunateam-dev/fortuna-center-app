import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({ success: true, message: "Logged out successfully" });

        // Clear local session cookie (used by local auth mode)
        response.cookies.set("local_session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0, // expire immediately
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}

