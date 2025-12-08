import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/youtube/client';
import { db } from "@/db";
import { systemSettings } from "@/db/schema/settings.schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('YouTube OAuth Error:', error);
      return NextResponse.redirect(
        new URL(`/admin/dashboard?error=${error}`, request.url)
      );
    }

    // Validate auth code
    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/dashboard?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store tokens in DB
    await db
      .insert(systemSettings)
      .values({
        key: "youtube_tokens",
        value: JSON.stringify(tokens),
        description: "YouTube OAuth tokens including access and refresh tokens",
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: JSON.stringify(tokens),
          updatedAt: new Date(),
        },
      });

    console.log('YouTube OAuth Success:', {
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expiry_date,
    });

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/admin/dashboard?youtube_connected=true', request.url)
    );
  } catch (error: any) {
    console.error('YouTube OAuth Callback Error:', error);
    return NextResponse.redirect(
      new URL(`/admin/dashboard?error=${error.message}`, request.url)
    );
  }
}
