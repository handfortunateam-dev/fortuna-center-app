import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { classes, users } from "@/db/schema";

type CreateClassPayload = {
  name?: string;
  description?: string | null;
  code?: string;
  isActive?: boolean;
  // createdBy is no longer expected in payload
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActiveParam = searchParams.get("isActive");
    const createdBy = searchParams.get("createdBy");
    const query = searchParams.get("q");

    const filters = [];
    if (isActiveParam !== null) {
      const normalized = isActiveParam.toLowerCase();
      const isActive = normalized === "true" || normalized === "1";
      filters.push(eq(classes.isActive, isActive));
    }
    if (createdBy) {
      filters.push(eq(classes.createdBy, createdBy));
    }
    if (query) {
      filters.push(ilike(classes.name, `%${query}%`));
    }

    const where = filters.length ? and(...filters) : undefined;
    const data = await db
      .select()
      .from(classes)
      .where(where)
      .orderBy(desc(classes.createdAt));

    return NextResponse.json({
      success: true,
      data,
      totalCount: data.length,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch classes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lookup database user ID from Clerk ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as CreateClassPayload;
    const { name, description = null, code, isActive = true } = body;

    if (!name || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, code",
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(classes)
      .values({
        name,
        description,
        code,
        isActive,
        createdBy: user.id, // Use database user ID (UUID)
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Class created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create class",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
