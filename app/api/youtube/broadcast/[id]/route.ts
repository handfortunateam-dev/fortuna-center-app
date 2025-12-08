/**
 * YouTube Broadcast Management
 * GET /api/youtube/broadcast/[id] - Get broadcast details
 * DELETE /api/youtube/broadcast/[id] - Delete broadcast
 */

import { NextRequest, NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';

function getYouTubeTokens() {
  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN || '';
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN || '';
  return { accessToken, refreshToken };
}

/**
 * Get Broadcast Details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id;

    const { accessToken, refreshToken } = getYouTubeTokens();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'YouTube not connected' },
        { status: 401 }
      );
    }

    const youtubeClient = new YouTubeClient(accessToken, refreshToken);
    const broadcast = await youtubeClient.getBroadcast(broadcastId);

    if (!broadcast) {
      return NextResponse.json(
        { error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: broadcast,
    });
  } catch (error: any) {
    console.error('Get Broadcast Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete Broadcast
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcastId = params.id;

    const { accessToken, refreshToken } = getYouTubeTokens();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'YouTube not connected' },
        { status: 401 }
      );
    }

    const youtubeClient = new YouTubeClient(accessToken, refreshToken);
    await youtubeClient.deleteBroadcast(broadcastId);

    return NextResponse.json({
      success: true,
      message: 'Broadcast deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Broadcast Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
