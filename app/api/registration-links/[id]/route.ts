import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrationLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [link] = await db
      .select()
      .from(registrationLinks)
      .where(eq(registrationLinks.id, id))
      .limit(1);

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: link });
  } catch (error: unknown) {
    console.error("Error fetching registration link:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch link",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (slug !== undefined) {
      updates.slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (label !== undefined) updates.label = label;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(registrationLinks)
      .set(updates)
      .where(eq(registrationLinks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Error updating registration link:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update link",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "DEVELOPER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const [deleted] = await db
      .delete(registrationLinks)
      .where(eq(registrationLinks.id, id))
      .returning({ id: registrationLinks.id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Registration link deleted",
    });
  } catch (error: unknown) {
    console.error("Error deleting registration link:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete link",
      },
      { status: 500 },
    );
  }
}
