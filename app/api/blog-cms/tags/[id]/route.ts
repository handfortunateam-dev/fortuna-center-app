import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { postTags } from "@/db/schema/post-tag.schema";

type UpdateTagPayload = {
    name?: string;
    slug?: string;
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const [tag] = await db
            .select()
            .from(postTags)
            .where(eq(postTags.id, id))
            .limit(1);

        if (!tag) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: tag });
    } catch (error) {
        console.error("Error fetching tag:", error);
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
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = (await request.json()) as UpdateTagPayload;
        const { name, slug } = body;

        // Check if exists
        const [existing] = await db
            .select()
            .from(postTags)
            .where(eq(postTags.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        // Check availability of slug if changed
        if (slug && slug !== existing.slug) {
            const [slugCheck] = await db
                .select()
                .from(postTags)
                .where(eq(postTags.slug, slug))
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
            .update(postTags)
            .set({
                ...(name && { name }),
                ...(slug && { slug }),
            })
            .where(eq(postTags.id, id))
            .returning();

        return NextResponse.json({ success: true, data: updated, message: "Tag updated successfully" });

    } catch (error) {
        console.error("Error updating tag:", error);
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
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const [deleted] = await db
            .delete(postTags)
            .where(eq(postTags.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Tag not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Tag deleted successfully" });

    } catch (error) {
        console.error("Error deleting tag:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
