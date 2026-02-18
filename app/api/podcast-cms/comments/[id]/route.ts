import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { podcastComments } from "@/db/schema/podcast-comment.schema";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [deleted] = await db
      .delete(podcastComments)
      .where(eq(podcastComments.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
