import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrations, registrationLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max submissions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
        },
        { status: 429 },
      );
    }

    const body = await req.json();

    // Honeypot check — if this field is filled, it's a bot
    if (body.website) {
      // Silently accept but don't save
      return NextResponse.json(
        { success: true, message: "Pendaftaran berhasil dikirim!" },
        { status: 201 },
      );
    }
    const {
      linkSlug,
      firstName,
      middleName,
      lastName,
      nickname,
      gender,
      placeOfBirth,
      dateOfBirth,
      phone,
      email,
      address,
      education,
      occupation,
    } = body;

    // Validate required fields
    if (!linkSlug || !firstName || !lastName || !gender || !phone) {
      return NextResponse.json(
        { success: false, message: "Data wajib belum lengkap" },
        { status: 400 },
      );
    }

    // Validate slug is active
    const [link] = await db
      .select({ slug: registrationLinks.slug })
      .from(registrationLinks)
      .where(
        and(
          eq(registrationLinks.slug, linkSlug),
          eq(registrationLinks.isActive, true),
        ),
      )
      .limit(1);

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Link pendaftaran tidak valid" },
        { status: 400 },
      );
    }

    // Sanitize phone — strip non-numeric except leading +
    const sanitizedPhone = phone.replace(/(?!^\+)[^\d]/g, "");

    // Insert registration
    const [created] = await db
      .insert(registrations)
      .values({
        linkSlug,
        firstName: firstName.trim(),
        middleName: middleName?.trim() || null,
        lastName: lastName.trim(),
        nickname: nickname?.trim() || null,
        gender,
        placeOfBirth: placeOfBirth?.trim() || null,
        dateOfBirth: dateOfBirth || null,
        phone: sanitizedPhone,
        email: email?.trim().toLowerCase() || null,
        address: address?.trim() || null,
        education: education?.trim() || null,
        occupation: occupation?.trim() || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil dikirim!",
        data: { id: created.id },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error submitting registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
