import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { postCategories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const categories = await db
            .select()
            .from(postCategories)
            .orderBy(desc(postCategories.createdAt));

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error("Fetch categories error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
