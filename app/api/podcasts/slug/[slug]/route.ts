import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { podcasts } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const podcast = await db.query.podcasts.findFirst({
      where: and(eq(podcasts.slug, slug), eq(podcasts.status, "published")),
      with: {
        author: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ success: false, message: "Podcast not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: podcast });
  } catch (error) {
    console.error("Error fetching podcast by slug:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
