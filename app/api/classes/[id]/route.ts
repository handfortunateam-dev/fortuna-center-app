import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, users } from "@/db/schema";

type UpdateClassPayload = {
  name?: string;
  description?: string | null;
  code?: string;
  isActive?: boolean;
  createdBy?: string;
};

const notFoundResponse = () =>
  NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [result] = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        code: classes.code,
        isActive: classes.isActive,
        createdBy: classes.createdBy,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        createdByName: users.name,
      })
      .from(classes)
      .leftJoin(users, eq(classes.createdBy, users.id))
      .where(eq(classes.id, id))
      .limit(1);

    if (!result) {
      return notFoundResponse();
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error reading class:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch class",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as UpdateClassPayload;
    const { name, description, code, isActive, createdBy } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (code !== undefined) updates.code = code;
    if (isActive !== undefined) updates.isActive = isActive;
    if (createdBy !== undefined) updates.createdBy = createdBy;
    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      return NextResponse.json(
        { success: false, message: "No updates supplied" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(classes)
      .set(updates)
      .where(eq(classes.id, id))
      .returning();

    if (!updated) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update class",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(classes)
      .where(eq(classes.id, id))
      .returning({ id: classes.id });

    if (!deleted) {
      return notFoundResponse();
    }

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete class",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
