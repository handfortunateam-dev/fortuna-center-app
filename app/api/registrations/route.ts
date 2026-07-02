import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const linkSlug = url.searchParams.get("linkSlug") || "";

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(registrations.firstName, `%${search}%`),
          ilike(registrations.lastName, `%${search}%`),
          ilike(registrations.phone, `%${search}%`),
          ilike(registrations.email, `%${search}%`),
        ),
      );
    }

    if (status) {
      conditions.push(eq(registrations.status, status as "pending" | "reviewed" | "accepted" | "rejected"));
    }

    if (linkSlug) {
      conditions.push(eq(registrations.linkSlug, linkSlug));
    }

    const queryConditions =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(registrations)
      .where(queryConditions)
      .orderBy(desc(registrations.createdAt));

    return NextResponse.json({ data, totalCount: data.length });
  } catch (error: unknown) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch registrations",
      },
      { status: 500 },
    );
  }
}
