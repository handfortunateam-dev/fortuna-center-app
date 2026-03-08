import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";

import { and, desc, eq, ilike, sql } from "drizzle-orm";
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
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const fields = searchParams.get("fields");

    const offset = limit && page ? (Number(page) - 1) * Number(limit) : 0;

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

    // Helper to filter object fields
    const filterFields = (obj: Record<string, unknown>, fields: string[] | null) => {
      if (!fields) return obj;
      const filtered: Record<string, unknown> = {};
      fields.forEach((f: string) => {
        if (f in obj) filtered[f] = obj[f];
      });
      return filtered;
    };

    const fieldList = fields ? fields.split(",").map((f: string) => f.trim()) : null;

    const dbData = await db
      .select()
      .from(classes)
      .where(where)
      .orderBy(desc(classes.createdAt))
      .limit(limit ? Number(limit) : 1000)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ total: sql<number>`count(*)` })
      .from(classes)
      .where(where);

    const totalCount = Number(totalCountResult[0]?.total || 0);

    const data = dbData.map((item) => filterFields(item as unknown as Record<string, unknown>, fieldList));

    return NextResponse.json({
      success: true,
      data,
      totalCount,
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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
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
        createdBy: user.id,
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
