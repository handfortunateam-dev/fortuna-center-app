/**
 * YouTube Broadcast API
 * POST /api/youtube/broadcast - Create new broadcast
 * GET /api/youtube/broadcast - List broadcasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';

// TODO: Replace with actual token retrieval from database/session
function getYouTubeTokens() {
  // This should fetch from database based on authenticated user
  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN || '';
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN || '';
  return { accessToken, refreshToken };
}

/**
 * Create YouTube Broadcast
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      scheduledStartTime,
      privacyStatus = 'public',
      enableDvr = true,
      enableEmbed = true,
      enableAutoStart = true,
      enableAutoStop = true,
      recordFromStart = true,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get YouTube tokens
    const { accessToken, refreshToken } = getYouTubeTokens();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'YouTube not connected. Please authorize first.' },
        { status: 401 }
      );
    }

    // Create YouTube client
    const youtubeClient = new YouTubeClient(accessToken, refreshToken);

    // Create broadcast
    const result = await youtubeClient.createBroadcast({
      title,
      description,
      scheduledStartTime,
      privacyStatus,
      enableDvr,
      enableEmbed,
      enableAutoStart,
      enableAutoStop,
      recordFromStart,
    });

    // TODO: Save broadcast details to database
    // - broadcastId
    // - streamId
    // - rtmpUrl & streamKey
    // - liveChatId
    // - watchUrl & embedUrl

    return NextResponse.json({
      success: true,
      data: result,
      message: 'YouTube broadcast created successfully',
    });
  } catch (error: any) {
    console.error('Create YouTube Broadcast Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create YouTube broadcast' },
      { status: 500 }
    );
  }
}

/**
 * List YouTube Broadcasts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    // Get YouTube tokens
    const { accessToken, refreshToken } = getYouTubeTokens();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'YouTube not connected. Please authorize first.' },
        { status: 401 }
      );
    }

    // Create YouTube client
    const youtubeClient = new YouTubeClient(accessToken, refreshToken);

    // List broadcasts
    const broadcasts = await youtubeClient.listBroadcasts(maxResults);

    return NextResponse.json({
      success: true,
      data: broadcasts,
      count: broadcasts.length,
    });
  } catch (error: any) {
    console.error('List YouTube Broadcasts Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list YouTube broadcasts' },
      { status: 500 }
    );
  }
}
