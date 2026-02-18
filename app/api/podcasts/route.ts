import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { podcasts } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const data = await db.query.podcasts.findMany({
      where: eq(podcasts.status, "published"),
      orderBy: [desc(podcasts.createdAt)],
      with: {
        author: {
          columns: { name: true },
        },
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching public podcasts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch podcasts" },
      { status: 500 }
    );
  }
}
