/**
 * YouTube OAuth - Initiate Authorization
 * GET /api/auth/youtube
 */

import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeAuthUrl } from '@/lib/youtube/client';

export async function GET(request: NextRequest) {
  try {
    // Get optional state parameter (e.g., user ID or session ID)
    const state = request.nextUrl.searchParams.get('state') || undefined;

    // Generate YouTube OAuth URL
    const authUrl = getYouTubeAuthUrl(state);

    // Redirect to YouTube OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('YouTube OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate YouTube authorization' },
      { status: 500 }
    );
  }
}
