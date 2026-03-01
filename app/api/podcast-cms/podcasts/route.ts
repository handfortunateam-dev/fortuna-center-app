import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { podcasts, users } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const status = searchParams.get("status");

    const filters = [];
    if (query) {
      filters.push(
        sql`(${ilike(podcasts.title, `%${query}%`)} OR ${ilike(
          podcasts.description,
          `%${query}%`
        )})`
      );
    }
    if (status) {
      filters.push(eq(podcasts.status, status as "draft" | "published" | "archived"));
    }

    const where = filters.length ? and(...filters) : undefined;

    const rawData = await db.query.podcasts.findMany({
      where,
      orderBy: [desc(podcasts.createdAt)],
      with: {
        author: {
          columns: { name: true },
        },
      },
    });

    const data = rawData.map((show) => ({
      id: show.id,
      title: show.title,
      slug: show.slug,
      status: show.status,
      episodeCount: show.episodeCount,
      publishedAt: show.publishedAt,
      createdAt: show.createdAt,
      updatedAt: show.updatedAt,
      authorName: show.author?.name || "Unknown",
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch podcasts", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug: providedSlug, description, coverImage, status = "draft", publishedAt } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    let finalSlug = providedSlug || title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    if (!providedSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const [newPodcast] = await db
      .insert(podcasts)
      .values({
        title,
        slug: finalSlug,
        description,
        coverImage,
        authorId: user.id, // Always use authenticated user's UUID from users table
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : status === "published" ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ success: true, data: newPodcast, message: "Podcast created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating podcast:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create podcast", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
