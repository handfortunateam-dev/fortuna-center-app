import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrationLinks } from "@/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const conditions = [];

    if (search) {
      conditions.push(
        ilike(registrationLinks.label, `%${search}%`),
      );
    }

    const queryConditions =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(registrationLinks)
      .where(queryConditions)
      .orderBy(desc(registrationLinks.createdAt));

    return NextResponse.json({ data, totalCount: data.length });
  } catch (error: unknown) {
    console.error("Error fetching registration links:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch links",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { slug, label, description, isActive } = body;

    if (!slug || !label) {
      return NextResponse.json(
        { success: false, message: "Slug and label are required" },
        { status: 400 },
      );
    }

    // Sanitize slug: lowercase, alphanumeric + hyphens only
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check duplicate
    const [existing] = await db
      .select({ id: registrationLinks.id })
      .from(registrationLinks)
      .where(eq(registrationLinks.slug, sanitizedSlug))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Slug already exists" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(registrationLinks)
      .values({
        slug: sanitizedSlug,
        label,
        description: description || null,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating registration link:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create link",
      },
      { status: 500 },
    );
  }
}
