import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
    );

    const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline", // Crucial for receiving a refresh token
        scope: scopes,
        prompt: "consent", // Force consent to ensure refresh token is returned
    });

    return NextResponse.json({ url });
}
