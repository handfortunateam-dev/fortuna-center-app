import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { postCategories } from "@/db/schema/post-category.schema";

type UpdateCategoryPayload = {
    name?: string;
    slug?: string;
    description?: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } } // Next 15+ await params if async? Standard is safe for now.
) {
    try {
        const { id } = await params;

        const [category] = await db
            .select()
            .from(postCategories)
            .where(eq(postCategories.id, id))
            .limit(1);

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
        const body = (await request.json()) as UpdateCategoryPayload;
        const { name, slug, description } = body;

        // Check if exists
        const [existing] = await db
            .select()
            .from(postCategories)
            .where(eq(postCategories.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        // Check availability of slug if changed
        if (slug && slug !== existing.slug) {
            const [slugCheck] = await db
                .select()
                .from(postCategories)
                .where(eq(postCategories.slug, slug))
                .limit(1);

            if (slugCheck) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Slug is already taken",
                    },
                    { status: 409 }
                );
            }
        }

        const [updated] = await db
            .update(postCategories)
            .set({
                ...(name && { name }),
                ...(slug && { slug }),
                ...(description !== undefined && { description }), // allowing empty string
                updatedAt: new Date(),
            })
            .where(eq(postCategories.id, id))
            .returning();

        return NextResponse.json({ success: true, data: updated, message: "Category updated successfully" });

    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

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
            .delete(postCategories)
            .where(eq(postCategories.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Category deleted successfully" });

    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
