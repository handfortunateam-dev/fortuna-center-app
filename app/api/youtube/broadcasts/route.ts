import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema/settings.schema";
import { YouTubeClient } from "@/lib/youtube/client";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        // 1. Get tokens from DB
        const settings = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "youtube_tokens"),
        });

        if (!settings?.value) {
            return NextResponse.json({ error: "Not connected to YouTube" }, { status: 401 });
        }

        const tokens = JSON.parse(settings.value);

        // 2. Initialize YouTube Client
        const client = new YouTubeClient(tokens.access_token, tokens.refresh_token);

        // 3. Fetch broadcasts
        const broadcasts = await client.listBroadcasts(10);

        return NextResponse.json({ success: true, data: broadcasts });
    } catch (error: any) {
        console.error("Error fetching broadcasts:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch broadcasts" },
            { status: 500 }
        );
    }
}
