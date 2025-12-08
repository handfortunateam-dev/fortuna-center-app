/**
 * YouTube Broadcast Transition
 * POST /api/youtube/broadcast/[id]/transition
 *
 * Transitions broadcast between states:
 * - testing: Start testing mode
 * - live: Go live
 * - complete: End broadcast
 */

import { NextRequest, NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';

function getYouTubeTokens() {
  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN || '';
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN || '';
  return { accessToken, refreshToken };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id;
    const body = await request.json();
    const { action } = body; // 'testing', 'live', or 'complete'

    if (!action || !['testing', 'live', 'complete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: testing, live, or complete' },
        { status: 400 }
      );
    }

    const { accessToken, refreshToken } = getYouTubeTokens();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'YouTube not connected' },
        { status: 401 }
      );
    }

    const youtubeClient = new YouTubeClient(accessToken, refreshToken);

    let result;
    switch (action) {
      case 'testing':
        result = await youtubeClient.startTesting(broadcastId);
        break;
      case 'live':
        result = await youtubeClient.goLive(broadcastId);
        break;
      case 'complete':
        result = await youtubeClient.endBroadcast(broadcastId);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Broadcast transitioned to ${action}`,
    });
  } catch (error: any) {
    console.error('Broadcast Transition Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
