// services/azuracast/client.ts

import {
    NowPlayingResponse,
    Station,
    StationMount,
    Podcast,
    PodcastEpisodesResponse,
    HlsInfo,
} from "./interfaces";
import { apiGet, fixPodcast, fixEpisode } from "./helpers";

const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID!;

/**
 * Public API: now playing for ALL stations
 */
export function getAllNowPlaying(): Promise<NowPlayingResponse[]> {
    return apiGet<NowPlayingResponse[]>("/api/nowplaying");
}

/**
 * Public API: now playing for 1 station
 */
export function getNowPlaying(): Promise<NowPlayingResponse> {
    return apiGet<NowPlayingResponse>(`/api/nowplaying/${STATION_ID}`);
}

/**
 * Public API: list of all public stations
 */
export function getStations(): Promise<Station[]> {
    return apiGet<Station[]>("/api/stations");
}

/**
 * Public API: station detail
 */
export function getStationDetail(): Promise<Station> {
    return apiGet<Station>(`/api/station/${STATION_ID}`);
}

/**
 * Public API: station mounts (streams)
 */
export function getMounts(): Promise<StationMount[]> {
    return apiGet<StationMount[]>(`/api/station/${STATION_ID}/mounts`);
}

/**
 * Public API: station streams (user specified)
 */
export function getStreams(): Promise<StationMount[]> {
    return apiGet<StationMount[]>(`/api/station/${STATION_ID}/streams`);
}

/**
 * Public API: HLS info (if enabled)
 */
export function getHlsInfo(): Promise<HlsInfo> {
    return apiGet<HlsInfo>(`/api/station/${STATION_ID}/hls`);
}

/**
 * Public API: podcasts
 */
export async function getPodcasts(): Promise<Podcast[]> {
    const podcasts = await apiGet<Podcast[]>(`/api/station/${STATION_ID}/public/podcasts`);
    return podcasts.map(fixPodcast);
}

/**
 * Public API: single podcast
 */
export async function getPodcast(podcastId: string): Promise<Podcast> {
    const podcast = await apiGet<Podcast>(`/api/station/${STATION_ID}/public/podcast/${podcastId}`);
    return fixPodcast(podcast);
}

/**
 * Public API: podcast episodes
 */
export async function getPodcastEpisodes(
    podcastId: string,
    page: number = 1,
    per_page: number = 10,
    query?: string
): Promise<PodcastEpisodesResponse> {
    // Using internal=true, rowCount, and current as requested by user pattern
    let url = `/api/station/${STATION_ID}/public/podcast/${podcastId}/episodes?internal=true&rowCount=${per_page}&current=${page}`;
    if (query) {
        url += `&searchPhrase=${encodeURIComponent(query)}`;
    }
    const response = await apiGet<PodcastEpisodesResponse>(url);
    return {
        ...response,
        rows: response.rows.map(fixEpisode),
    };
}

/**
 * Convenience: only song history (extract from now playing)
 */
export async function getSongHistory() {
    const np = await getNowPlaying();
    return np.song_history;
}
