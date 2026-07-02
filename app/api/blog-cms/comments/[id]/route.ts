import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { postComments } from "@/db/schema/post-comment.schema";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const [deleted] = await db
            .delete(postComments)
            .where(eq(postComments.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Comment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
