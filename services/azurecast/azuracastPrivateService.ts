"use server";

import {
    Streamer,
    CreateStreamerPayload,
    UpdateStreamerPayload,
    AzuraLogFile,
    Podcast,
    PodcastEpisodesResponse,
    PodcastEpisode,
    UpdatePodcastEpisodePayload,
    PodcastPlaylist,
    UpdatePodcastPayload,
    CreatePodcastPayload,
    VuePodcastsResponse,
    StorageQuota,
    DashboardChartsResponse,
    StreamersResponse,
    VueStreamersResponse,
} from "./interfaces";
import { resolveUrl, fixPodcast, fixEpisode, fixStreamer } from "./helpers";


const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY;
const STATION_ID = process.env.AZURACAST_STATION_ID || "1";

async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    if (!AZURACAST_API_KEY) {
        throw new Error("AZURACAST_API_KEY is not set in environment variables");
    }

    const fullUrl = resolveUrl(path);

    const res = await fetch(fullUrl, {
        ...options,
        headers: {
            "X-API-Key": AZURACAST_API_KEY,
            "Content-Type": "application/json",
            ...options.headers,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(
            `AzuraCast API ${options.method || "GET"} ${path} failed: ${res.status} ${msg}`
        );
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}



/**
 * Admin API: Get a single streamer by ID
 */
export async function getStreamer(id: number): Promise<Streamer> {
    const streamer = await apiRequest<Streamer>(`/api/station/${STATION_ID}/streamer/${id}`);
    return fixStreamer(streamer);
}



/**
 * Admin API: Get list of available log files
 */
export async function getLogFiles(): Promise<AzuraLogFile[]> {
    return apiRequest<AzuraLogFile[]>(`/api/station/${STATION_ID}/logs`);
}

/**
 * Admin API: Get content of a specific log file
 */
export async function getLogFileContent(name: string): Promise<string> {
    if (!AZURACAST_API_KEY) {
        throw new Error("AZURACAST_API_KEY is not set in environment variables");
    }

    const fullUrl = resolveUrl(`/api/admin/log/${name}`);

    const res = await fetch(fullUrl, {
        headers: {
            "X-API-Key": AZURACAST_API_KEY,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(
            `AzuraCast API GET /api/admin/log/${name} failed: ${res.status} ${msg}`
        );
    }

    return res.text();
}

/**
 * Convenience: Get Liquidsoap log content
 */
export async function getLiquidsoapLog(): Promise<string> {
    return getLogFileContent("liquidsoap.log");
}

/**
 * Convenience: Get Icecast log content
 */
export async function getIcecastLog(): Promise<string> {
    return getLogFileContent("icecast.log");
}



/**
 * Admin API: Get all podcasts
 */
export async function getPodcasts(): Promise<Podcast[]> {
    const podcasts = await apiRequest<Podcast[]>(`/api/station/${STATION_ID}/podcasts`);
    return podcasts.map(fixPodcast);
}

/**
 * Admin API: Get a single podcast by ID
 */
export async function getPodcast(id: string): Promise<Podcast> {
    const podcast = await apiRequest<Podcast>(`/api/station/${STATION_ID}/podcast/${id}`);
    return fixPodcast(podcast);
}

/**
 * Admin API: Get episodes for a podcast
 */
export async function getPodcastEpisodes(id: string): Promise<PodcastEpisodesResponse> {
    const data = await apiRequest<any>(`/api/station/${STATION_ID}/podcast/${id}/episodes`);

    if (Array.isArray(data)) {
        return {
            page: 1,
            per_page: data.length,
            total: data.length,
            total_pages: 1,
            links: { first: "", previous: "", next: "", last: "" },
            rows: data.map(fixEpisode)
        };
    }

    if (data && Array.isArray(data.rows)) {
        return {
            ...data,
            rows: data.rows.map(fixEpisode),
        };
    }

    return {
        page: 1,
        per_page: 0,
        total: 0,
        total_pages: 1,
        links: { first: "", previous: "", next: "", last: "" },
        rows: []
    };
}

/**
 * Admin API: Get a single podcast episode
 */
export async function getPodcastEpisode(podcastId: string, episodeId: string): Promise<PodcastEpisode> {
    const episode = await apiRequest<PodcastEpisode>(`/api/station/${STATION_ID}/podcast/${podcastId}/episode/${episodeId}`);
    return fixEpisode(episode);
}

/**
 * Admin API: Update a podcast episode
 */
export async function updatePodcastEpisode(
    podcastId: string,
    episodeId: string,
    payload: UpdatePodcastEpisodePayload
): Promise<PodcastEpisode> {
    return apiRequest<PodcastEpisode>(`/api/station/${STATION_ID}/podcast/${podcastId}/episode/${episodeId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * Admin API: Get available playlists for podcasts
 */
export async function getPodcastPlaylists(): Promise<PodcastPlaylist[]> {
    return apiRequest<PodcastPlaylist[]>(`/api/station/${STATION_ID}/podcasts/playlists`);
}

/**
 * Admin API: Update a podcast
 */
export async function updatePodcast(
    podcastId: string,
    payload: UpdatePodcastPayload
): Promise<Podcast> {
    return apiRequest<Podcast>(`/api/station/${STATION_ID}/podcast/${podcastId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * Admin API: Create a new podcast
 */
export async function createPodcast(
    payload: CreatePodcastPayload
): Promise<Podcast> {
    return apiRequest<Podcast>(`/api/station/${STATION_ID}/podcasts`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Admin API: Create a new podcast episode
 */
export async function createPodcastEpisode(
    podcastId: string,
    payload: UpdatePodcastEpisodePayload
): Promise<PodcastEpisode> {
    return apiRequest<PodcastEpisode>(`/api/station/${STATION_ID}/podcast/${podcastId}/episodes`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Admin API: Upload media for a podcast episode
 */
export async function uploadPodcastMedia(
    podcastId: string,
    formData: FormData
): Promise<PodcastEpisode> {
    if (!AZURACAST_API_KEY) {
        throw new Error("AZURACAST_API_KEY is not set in environment variables");
    }

    const fullUrl = resolveUrl(`/api/station/${STATION_ID}/podcast/${podcastId}/episodes/media`);
    console.log("Uploading media to:", fullUrl);

    try {
        const res = await fetch(fullUrl, {
            method: "POST",
            headers: {
                "X-API-Key": AZURACAST_API_KEY,
            },
            body: formData,
            cache: "no-store",
        });

        const responseText = await res.text();
        console.log("Upload response status:", res.status);
        console.log("Upload response body:", responseText);

        if (!res.ok) {
            throw new Error(
                `AzuraCast API POST ${fullUrl} failed: ${res.status} ${responseText}`
            );
        }

        try {
            return JSON.parse(responseText);
        } catch {
            // If it's not JSON, assume it's the path string or similar
            // We cast to any because the signature says Promise<PodcastEpisode> but we might return string
            return responseText as unknown as PodcastEpisode;
        }
    } catch (error) {
        console.error("uploadPodcastMedia error:", error);
        throw error;
    }
}

/**
 * Admin API: Delete media for a podcast episode
 */
export async function deletePodcastEpisodeMedia(
    podcastId: string,
    episodeId: string
): Promise<void> {
    return apiRequest<void>(`/api/station/${STATION_ID}/podcast/${podcastId}/episode/${episodeId}/media`, {
        method: "DELETE",
    });
}

/**
 * Admin API: Delete a podcast episode
 */
export async function deletePodcastEpisode(
    podcastId: string,
    episodeId: string
): Promise<void> {
    return apiRequest<void>(`/api/station/${STATION_ID}/podcast/${podcastId}/episode/${episodeId}`, {
        method: "DELETE",
    });
}

/**
 * Admin API: Delete a podcast
 */
export async function deletePodcast(podcastId: string): Promise<void> {
    return apiRequest<void>(`/api/station/${STATION_ID}/podcast/${podcastId}`, {
        method: "DELETE",
    });
}

/**
 * Admin API: Get Vue Podcasts Data (Language and Category Options)
 */
export async function getVuePodcastsData(): Promise<VuePodcastsResponse> {
    return apiRequest<VuePodcastsResponse>(`/api/station/${STATION_ID}/vue/podcasts`);
}

/**
 * Admin API: Get Station Podcasts Storage Quota
 */
export async function getStationPodcastsQuota(): Promise<StorageQuota> {
    return apiRequest<StorageQuota>(`/api/station/${STATION_ID}/quota/station_podcasts`);
}

/**
 * Admin API: Get Dashboard Charts
 */
export async function getDashboardCharts(): Promise<DashboardChartsResponse> {
    return apiRequest<DashboardChartsResponse>(`/api/frontend/dashboard/charts`);
}

/**
 * Admin API: Get Streamers
 */
export async function getStreamers(page: number = 1, rowCount: number = 25, search: string = ""): Promise<StreamersResponse> {
    const query = new URLSearchParams({
        page: page.toString(),
        rowCount: rowCount.toString(),
        search: search,
    });
    const data = await apiRequest<StreamersResponse>(`/api/station/${STATION_ID}/streamers?${query.toString()}`);
    return {
        ...data,
        rows: data.rows.map(fixStreamer),
    };
}

/**
 * Admin API: Get Vue Streamers (Connection Info)
 */
export async function getVueStreamers(): Promise<VueStreamersResponse> {
    return apiRequest<VueStreamersResponse>(`/api/station/${STATION_ID}/vue/streamers`);
}

/**
 * Admin API: Create Streamer
 */
export async function createStreamer(data: CreateStreamerPayload): Promise<Streamer> {
    const streamer = await apiRequest<Streamer>(`/api/station/${STATION_ID}/streamers`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return fixStreamer(streamer);
}

/**
 * Admin API: Update Streamer
 */
export async function updateStreamer(id: number, data: UpdateStreamerPayload): Promise<Streamer> {
    const streamer = await apiRequest<Streamer>(`/api/station/${STATION_ID}/streamer/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return fixStreamer(streamer);
}

/**
 * Admin API: Delete Streamer
 */
export async function deleteStreamer(id: number): Promise<void> {
    await apiRequest<void>(`/api/station/${STATION_ID}/streamer/${id}`, {
        method: "DELETE",
    });
}
