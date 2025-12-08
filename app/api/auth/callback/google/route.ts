import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "@/services/youtubeService";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const logout = searchParams.get("logout");

    if (logout) {
        const response = NextResponse.redirect(new URL("/youtube-integration", request.url));
        response.cookies.delete("youtube_access_token");
        response.cookies.delete("youtube_refresh_token");
        return response;
    }

    if (!code) {
        return NextResponse.json({ error: "No code provided. If you are trying to authenticate, please start from the integration page." }, { status: 400 });
    }

    try {
        const tokens = await getTokens(code);

        // Redirect to the YouTube integration page
        const response = NextResponse.redirect(new URL("/youtube-integration", request.url));

        // Store tokens in cookies
        // Note: In production, consider storing refresh tokens securely in DB and encrypting cookies
        if (tokens.access_token) {
            response.cookies.set("youtube_access_token", tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: (tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600 * 1000) / 1000,
            });
        }

        if (tokens.refresh_token) {
            response.cookies.set("youtube_refresh_token", tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 30 * 24 * 60 * 60, // 30 days
            });
        }

        return response;
    } catch (error) {
        console.error("Error exchanging code for token:", error);
        return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
    }
}
