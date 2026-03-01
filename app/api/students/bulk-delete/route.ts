import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

export async function DELETE(request: NextRequest) {
    try {
        const authenticatedUser = await getAuthUser();
        if (!authenticatedUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { ids } = body as { ids: string[] };

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, message: "No IDs provided" },
                { status: 400 }
            );
        }

        if (ids.length > 500) {
            return NextResponse.json(
                { success: false, message: "Cannot delete more than 500 records at once" },
                { status: 400 }
            );
        }

        const deleted = await db
            .delete(students)
            .where(inArray(students.id, ids))
            .returning({ id: students.id });

        return NextResponse.json({
            success: true,
            message: `${deleted.length} student(s) deleted successfully`,
            deletedCount: deleted.length,
        });
    } catch (error) {
        console.error("Error bulk deleting students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to bulk delete students",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
