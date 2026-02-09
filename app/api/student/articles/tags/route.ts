import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { postTags } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const tags = await db
            .select()
            .from(postTags)
            .orderBy(desc(postTags.createdAt));

        return NextResponse.json({ success: true, data: tags });
    } catch (error) {
        console.error("Fetch tags error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
