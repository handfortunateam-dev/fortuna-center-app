"use server";

import { google } from "googleapis";
import { unstable_cache } from "next/cache";

// Initialize the YouTube API client
const youtube = google.youtube("v3");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Cache durations (in seconds)
// 1 hour for standard lists, 15 mins for live checks
const CACHE_DURATION_LONG = 3600;
const CACHE_DURATION_SHORT = 900;


const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

export interface YouTubeChannelStatistics {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
}


// Interface for LiveBroadcast resource (simplified based on provided JSON)
export interface YouTubeLiveBroadcast {
    id: string;
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        scheduledStartTime?: string;
        scheduledEndTime?: string;
        actualStartTime?: string;
        actualEndTime?: string;
        isDefaultBroadcast?: boolean;
        thumbnails: {
            default?: { url: string; width: number; height: number };
            medium?: { url: string; width: number; height: number };
            high?: { url: string; width: number; height: number };
        };
    };
    status: {
        lifeCycleStatus: "complete" | "created" | "live" | "liveStarting" | "ready" | "revoked" | "testStarting" | "testing";
        privacyStatus: "private" | "public" | "unlisted";
        recordingStatus: "notRecording" | "recorded" | "recording";
        madeForKids?: boolean;
    };
    contentDetails: {
        boundStreamId?: string;
        enableEmbed?: boolean;
        enableDvr?: boolean;
        recordFromStart?: boolean;
        monitorStream?: {
            embedHtml?: string;
        };
    };
}

export async function getAuthUrl() {
    const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.force-ssl"
    ];

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        include_granted_scopes: true,
    });
}

export async function getTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Get list of live broadcasts from YouTube
 * Note: This requires an authorized OAuth2 client. 
 * Since we don't have a persistent token storage implemented here yet, 
 * this function assumes a way to get the Access Token, 
 * or it will fail if not authenticated.
 * 
 * For server-to-server without user interaction, a Service Account could be used, 
 * but YouTube Data API often requires user context (OAuth) for 'mine=true'.
 */
export async function getLiveBroadcasts(accessToken?: string): Promise<YouTubeLiveBroadcast[]> {
    if (accessToken) {
        oauth2Client.setCredentials({ access_token: accessToken });
    } else {
        // If no access token provided, we rely on environment variable or throw error
        // For now, let's assume we might have a refresh token stored or passed
        // But since the user just gave Client ID/Secret, we are likely missing the initial Auth Flow.
        console.warn("No access token provided for YouTube API. Calls might fail if not public.");
    }

    try {
        const response = await youtube.liveBroadcasts.list({
            auth: oauth2Client,
            part: ["snippet", "status", "contentDetails", "statistics"],
            // broadcastStatus: "all", // incompatible with mine: true
            mine: true, // Get broadcasts for the authenticated user
        });

        const broadcasts = response.data.items as YouTubeLiveBroadcast[];
        return broadcasts || [];
    } catch (error) {
        console.error("Error fetching YouTube live broadcasts:", error);
        throw new Error("Failed to fetch YouTube live broadcasts");
    }
}

/**
 * Get a specific live broadcast by ID
 */
export async function getLiveBroadcastById(id: string, accessToken?: string): Promise<YouTubeLiveBroadcast | null> {
    if (accessToken) {
        oauth2Client.setCredentials({ access_token: accessToken });
    }

    try {
        const response = await youtube.liveBroadcasts.list({
            auth: oauth2Client,
            part: ["snippet", "status", "contentDetails", "statistics"],
            id: [id],
        });

        const items = response.data.items as YouTubeLiveBroadcast[];
        return items.length > 0 ? items[0] : null;
    } catch (error) {
        console.error(`Error fetching YouTube live broadcast ${id}:`, error);
        throw error;
    }
}

/**
 * Public: Get video details by ID
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!GOOGLE_API_KEY) {
        return null;
    }

    try {
        const response = await youtube.videos.list({
            key: GOOGLE_API_KEY,
            part: ["snippet"],
            id: [videoId],
        });

        const items = response.data.items;
        if (items && items.length > 0) {
            const video = items[0];
            // Manual cast/adaptation because videos.list returns string ID, search.list returns object ID
            return {
                ...video,
                id: {
                    kind: "youtube#video",
                    videoId: typeof video.id === 'string' ? video.id : ""
                }
            } as unknown as YouTubeVideo;
        }
        return items && items.length > 0 ? (items[0] as unknown as YouTubeVideo) : null;
    } catch (error) {
        console.error(`Error fetching video details ${videoId}:`, error);
        return null;
    }
}
// Public API Data Interfaces
export interface YouTubeVideo {
    id: {
        kind: string;
        videoId: string;
    };
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default?: { url: string; width: number; height: number };
            medium?: { url: string; width: number; height: number };
            high?: { url: string; width: number; height: number };
        };
        channelTitle: string;
        liveBroadcastContent: string;
    };
}

export interface YouTubePlaylist {
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default?: { url: string; width: number; height: number };
            medium?: { url: string; width: number; height: number };
            high?: { url: string; width: number; height: number };
        };
        channelTitle: string;
    };
    contentDetails: {
        itemCount: number;
    };
}

export interface YouTubePlaylistItem {
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default?: { url: string; width: number; height: number };
            medium?: { url: string; width: number; height: number };
            high?: { url: string; width: number; height: number };
        };
        channelTitle: string;
        resourceId: {
            kind: string;
            videoId: string;
        };
    };
}

// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Public: Get recent videos (uploads) for a channel
 */
export const getChannelVideos = unstable_cache(
    async (channelId: string): Promise<YouTubeVideo[]> => {
        if (!GOOGLE_API_KEY) {
            return [];
        }

        try {
            const response = await youtube.search.list({
                key: GOOGLE_API_KEY,
                part: ["snippet"],
                channelId: channelId,
                type: ["video"],
                order: "date",
                maxResults: 9,
            });

            return (response.data.items as YouTubeVideo[]) || [];
        } catch (error) {
            console.error("Error fetching channel videos:", error);
            return [];
        }
    },
    ["channel-videos"],
    { revalidate: CACHE_DURATION_LONG }
);

/**
 * Public: Get past live broadcasts (videos) for a channel
 * Requires GOOGLE_API_KEY in .env
 */
export async function getPastBroadcasts(channelId: string): Promise<YouTubeVideo[]> {
    if (!GOOGLE_API_KEY) {
        console.warn("GOOGLE_API_KEY is not set. Cannot fetch public YouTube data.");
        return [];
    }

    try {
        const response = await youtube.search.list({
            key: GOOGLE_API_KEY,
            part: ["snippet"],
            channelId: channelId,
            eventType: "completed",
            type: ["video"],
            order: "date",
            maxResults: 6,
        });

        return (response.data.items as YouTubeVideo[]) || [];
    } catch (error) {
        console.error("Error fetching past broadcasts:", error);
        return [];
    }
}

/**
 * Public: Get current live broadcasts (videos) for a channel
 * Requires GOOGLE_API_KEY in .env
 */
export async function getCurrentBroadcasts(channelId: string): Promise<YouTubeVideo[]> {
    if (!GOOGLE_API_KEY) {
        return [];
    }

    try {
        const response = await youtube.search.list({
            key: GOOGLE_API_KEY,
            part: ["snippet"],
            channelId: channelId,
            eventType: "live",
            type: ["video"],
            order: "date",
            maxResults: 3,
        });

        return (response.data.items as YouTubeVideo[]) || [];
    } catch (error) {
        console.error("Error fetching current broadcasts:", error);
        return [];
    }
}

/**
 * Public: Get playlists for a channel
 */
export const getChannelPlaylists = unstable_cache(
    async (channelId: string): Promise<YouTubePlaylist[]> => {
        if (!GOOGLE_API_KEY) {
            return [];
        }

        try {
            const response = await youtube.playlists.list({
                key: GOOGLE_API_KEY,
                part: ["snippet", "contentDetails"],
                channelId: channelId,
                maxResults: 10,
            });

            return (response.data.items as YouTubePlaylist[]) || [];
        } catch (error) {
            console.error("Error fetching playlists:", error);
            return [];
        }
    },
    ["channel-playlists"],
    { revalidate: CACHE_DURATION_LONG }
);

/**
 * Public: Get items from a specific playlist
 */
export async function getPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
    if (!GOOGLE_API_KEY) {
        return [];
    }

    try {
        const response = await youtube.playlistItems.list({
            key: GOOGLE_API_KEY,
            part: ["snippet"],
            playlistId: playlistId,
            maxResults: 50,
        });

        return (response.data.items as YouTubePlaylistItem[]) || [];
    } catch (error) {
        console.error("Error fetching playlist items:", error);
        return [];
    }
}

/**
 * Public: Get channel statistics
 */
export const getChannelStatistics = unstable_cache(
    async (channelId: string): Promise<YouTubeChannelStatistics | null> => {
        if (!GOOGLE_API_KEY) {
            return null;
        }

        try {
            const response = await youtube.channels.list({
                key: GOOGLE_API_KEY,
                part: ["statistics"],
                id: [channelId],
            });

            const items = response.data.items;
            if (items && items.length > 0 && items[0].statistics) {
                return items[0].statistics as YouTubeChannelStatistics;
            }
            return null;
        } catch (error) {
            console.error("Error fetching channel statistics:", error);
            return null;
        }
    },
    ["channel-statistics"],
    { revalidate: CACHE_DURATION_SHORT }
);

export interface YouTubeAnalyticsData {
    rows: any[][];
    columnHeaders: { name: string; columnType: string; dataType: string }[];
}

/**
 * Private: Get Channel Analytics (Chart Data)
 * Requires OAuth Access Token
 */
export async function getChannelAnalytics(accessToken: string, startDate: string, endDate: string): Promise<YouTubeAnalyticsData | null> {
    const youtubeAnalytics = google.youtubeAnalytics("v2");

    // Set credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
        const response = await youtubeAnalytics.reports.query({
            auth: oauth2Client,
            ids: "channel==MINE",
            startDate: startDate,
            endDate: endDate,
            metrics: "views,estimatedMinutesWatched,subscribersGained",
            dimensions: "day",
            sort: "day",
        });

        return {
            rows: response.data.rows || [],
            columnHeaders: (response.data.columnHeaders || []).map(header => ({
                name: header.name || "",
                columnType: header.columnType || "",
                dataType: header.dataType || ""
            })),
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return null;
    }
}

/**
 * Check Quota Health Status
 * Costs: 1 unit (videos.list)
 */
export async function checkQuotaHealth() {
    if (!GOOGLE_API_KEY) {
        return { status: 'error', message: 'Google API Key is not configured' };
    }

    try {
        // We use videos.list with chart='mostPopular' as it costs only 1 unit
        await youtube.videos.list({
            key: GOOGLE_API_KEY,
            part: ['id'],
            chart: 'mostPopular',
            maxResults: 1
        });
        return { status: 'ok', message: 'Operational' };
    } catch (error: any) {
        console.error("Quota check failed:", error);

        const message = error.message || "Unknown error";
        let reason = "unknown";

        if (error.response?.data?.error?.errors?.[0]?.reason) {
            reason = error.response.data.error.errors[0].reason;
        }

        if (error.code === 403 || reason === 'quotaExceeded') {
            return { status: 'quota_exceeded', message: 'Daily Quota Exceeded (10,000 units)' };
        }

        return { status: 'error', message };
    }
}
