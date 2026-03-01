import { NextResponse } from "next/server";
import { db } from "@/db";
import { tickets } from "@/db/schema/tickets.schema";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isDev = user.role === "DEVELOPER";

    if (!isDev) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Developer only" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminResponse } = body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;

      // If resolving, set resolvedAt and resolvedBy
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.id;
      }
    }

    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
    }

    const updatedTicket = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();

    if (!updatedTicket.length) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTicket[0],
      message: "Ticket updated successfully",
    });
  } catch (error) {
    console.error("[TICKETS_PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
