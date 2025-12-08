/**
 * @swagger
 * /api/classes:
 *   get:
 *     tags: [Classes]
 *     summary: List classes
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false", "1", "0"]
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Classes list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *   post:
 *     tags: [Classes]
 *     summary: Create class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";

type CreateClassPayload = {
  name?: string;
  description?: string | null;
  code?: string;
  isActive?: boolean;
  createdBy?: string;
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

    return NextResponse.json({ success: true, data });
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
    const body = (await request.json()) as CreateClassPayload;
    const { name, description = null, code, isActive = true, createdBy } = body;

    if (!name || !code || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, code, createdBy",
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
        createdBy,
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
