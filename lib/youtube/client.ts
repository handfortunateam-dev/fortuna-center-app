/**
 * YouTube API Client
 * Handles all YouTube Live Streaming API interactions
 */

import { google, youtube_v3 } from 'googleapis';

export interface YouTubeBroadcastConfig {
  title: string;
  description?: string;
  scheduledStartTime?: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
  enableDvr?: boolean;
  enableEmbed?: boolean;
  enableAutoStart?: boolean;
  enableAutoStop?: boolean;
  recordFromStart?: boolean;
}

export interface YouTubeStreamConfig {
  title: string;
  resolution?: '240p' | '360p' | '480p' | '720p' | '1080p';
  frameRate?: '30fps' | '60fps';
}

export interface YouTubeBroadcastResult {
  broadcastId: string;
  streamId: string;
  liveChatId: string;
  rtmpUrl: string;
  streamKey: string;
  videoId: string;
  watchUrl: string;
  embedUrl: string;
}

export class YouTubeClient {
  private youtube: youtube_v3.Youtube;
  private oauth2Client: any;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  /**
   * Create a complete YouTube broadcast (broadcast + stream + bind)
   */
  async createBroadcast(
    config: YouTubeBroadcastConfig
  ): Promise<YouTubeBroadcastResult> {
    try {
      // Step 1: Create broadcast
      const broadcast = await this.youtube.liveBroadcasts.insert({
        part: ['snippet', 'status', 'contentDetails'],
        requestBody: {
          snippet: {
            title: config.title,
            description: config.description,
            scheduledStartTime: config.scheduledStartTime || new Date().toISOString(),
          },
          status: {
            privacyStatus: config.privacyStatus,
            selfDeclaredMadeForKids: false,
          },
          contentDetails: {
            enableDvr: config.enableDvr ?? true,
            enableEmbed: config.enableEmbed ?? true,
            enableAutoStart: config.enableAutoStart ?? true,
            enableAutoStop: config.enableAutoStop ?? true,
            recordFromStart: config.recordFromStart ?? true,
            enableClosedCaptions: false,
          },
        },
      });

      const broadcastId = broadcast.data.id!;
      const liveChatId = broadcast.data.snippet?.liveChatId || '';

      // Step 2: Create stream
      const stream = await this.youtube.liveStreams.insert({
        part: ['snippet', 'cdn', 'status'],
        requestBody: {
          snippet: {
            title: `${config.title} - Stream`,
          },
          cdn: {
            frameRate: '30fps',
            ingestionType: 'rtmp',
            resolution: '1080p',
          },
        },
      });

      const streamId = stream.data.id!;
      const rtmpUrl = stream.data.cdn?.ingestionInfo?.ingestionAddress || '';
      const streamKey = stream.data.cdn?.ingestionInfo?.streamName || '';

      // Step 3: Bind stream to broadcast
      await this.youtube.liveBroadcasts.bind({
        part: ['snippet', 'status'],
        id: broadcastId,
        streamId: streamId,
      });

      // Step 4: Get video ID (same as broadcast ID for YouTube)
      const videoId = broadcastId;
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      return {
        broadcastId,
        streamId,
        liveChatId,
        rtmpUrl,
        streamKey,
        videoId,
        watchUrl,
        embedUrl,
      };
    } catch (error: any) {
      console.error('YouTube API Error:', error);
      throw new Error(`Failed to create YouTube broadcast: ${error.message}`);
    }
  }

  /**
   * Transition broadcast to testing mode
   */
  async startTesting(broadcastId: string) {
    try {
      const response = await this.youtube.liveBroadcasts.transition({
        broadcastStatus: 'testing',
        id: broadcastId,
        part: ['status'],
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to start testing: ${error.message}`);
    }
  }

  /**
   * Transition broadcast to live
   */
  async goLive(broadcastId: string) {
    try {
      const response = await this.youtube.liveBroadcasts.transition({
        broadcastStatus: 'live',
        id: broadcastId,
        part: ['status', 'snippet'],
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to go live: ${error.message}`);
    }
  }

  /**
   * End broadcast
   */
  async endBroadcast(broadcastId: string) {
    try {
      const response = await this.youtube.liveBroadcasts.transition({
        broadcastStatus: 'complete',
        id: broadcastId,
        part: ['status'],
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to end broadcast: ${error.message}`);
    }
  }

  /**
   * Get broadcast details
   */
  async getBroadcast(broadcastId: string) {
    try {
      const response = await this.youtube.liveBroadcasts.list({
        part: ['snippet', 'status', 'contentDetails', 'statistics'],
        id: [broadcastId],
      });
      return response.data.items?.[0];
    } catch (error: any) {
      throw new Error(`Failed to get broadcast: ${error.message}`);
    }
  }

  /**
   * Get stream health
   */
  async getStreamHealth(streamId: string) {
    try {
      const response = await this.youtube.liveStreams.list({
        part: ['status', 'cdn'],
        id: [streamId],
      });
      return response.data.items?.[0];
    } catch (error: any) {
      throw new Error(`Failed to get stream health: ${error.message}`);
    }
  }

  /**
   * List all broadcasts
   */
  async listBroadcasts(maxResults: number = 10) {
    try {
      const response = await this.youtube.liveBroadcasts.list({
        part: ['snippet', 'status', 'contentDetails'],
        broadcastStatus: 'all',
        maxResults,
      });
      return response.data.items || [];
    } catch (error: any) {
      throw new Error(`Failed to list broadcasts: ${error.message}`);
    }
  }

  /**
   * Delete broadcast
   */
  async deleteBroadcast(broadcastId: string) {
    try {
      await this.youtube.liveBroadcasts.delete({
        id: broadcastId,
      });
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete broadcast: ${error.message}`);
    }
  }

  /**
   * Get live chat messages
   */
  async getLiveChatMessages(liveChatId: string, pageToken?: string) {
    try {
      const response = await this.youtube.liveChatMessages.list({
        liveChatId,
        part: ['snippet', 'authorDetails'],
        maxResults: 200,
        pageToken,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get chat messages: ${error.message}`);
    }
  }

  /**
   * Send chat message
   */
  async sendChatMessage(liveChatId: string, message: string) {
    try {
      const response = await this.youtube.liveChatMessages.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            liveChatId,
            type: 'textMessageEvent',
            textMessageDetails: {
              messageText: message,
            },
          },
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send chat message: ${error.message}`);
    }
  }
}

/**
 * Helper function to generate OAuth URL
 */
export function getYouTubeAuthUrl(state?: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state || 'default',
    prompt: 'consent', // Force to get refresh token
  });
}

/**
 * Exchange auth code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
