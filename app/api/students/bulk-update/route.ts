import { NextRequest, NextResponse } from "next/server";
import { isAdmin, getAuthUser } from "@/lib/auth/getAuthUser";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
    try {
        const authenticatedUser = await getAuthUser();
        if (!authenticatedUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { success: false, message: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { updates } = body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json(
                { success: false, message: "No updates provided" },
                { status: 400 }
            );
        }

        const validUpdates = updates.filter((u: { id: string }) => u.id);

        if (validUpdates.length === 0) {
            return NextResponse.json(
                { success: false, message: "No valid updates with IDs" },
                { status: 400 }
            );
        }

        const now = new Date();

        await db.transaction(async (tx) => {
            const updatePromises = validUpdates.map((update: { id: string; education?: string; occupation?: string }) => 
                tx.update(students)
                    .set({
                        education: update.education || null,
                        occupation: update.occupation || null,
                        updatedAt: now,
                    })
                    .where(eq(students.id, update.id))
            );
            
            await Promise.all(updatePromises);
        });

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${validUpdates.length} students`,
            details: {
                success: validUpdates.length,
                failed: 0,
            }
        });

    } catch (error) {
        console.error("Error bulk updating students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to bulk update students",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
