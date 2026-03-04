import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrationLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Public endpoint — no auth needed
// Validates if a slug is active and returns basic info
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const [link] = await db
      .select({
        slug: registrationLinks.slug,
        label: registrationLinks.label,
        isActive: registrationLinks.isActive,
      })
      .from(registrationLinks)
      .where(
        and(
          eq(registrationLinks.slug, slug),
          eq(registrationLinks.isActive, true),
        ),
      )
      .limit(1);

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Link tidak valid atau sudah tidak aktif" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: link });
  } catch (error: unknown) {
    console.error("Error validating registration link:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
