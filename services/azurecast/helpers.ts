import {
    Podcast,
    PodcastEpisode,
    Streamer,
} from "./interfaces";

const BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL!;

export function cleanBase(url: string) {
    if (!url) return "";
    const trimmed = url.trim().replace(/\/+$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `http://${trimmed}`;
}

export function removePort3000(url: string) {
    return url.replace(":3000", "");
}

export function resolveUrl(path: string) {
    if (!path) {
        throw new Error("AzuraCast path is required");
    }
    const isAbsolute = /^https?:\/\//i.test(path);
    const base = removePort3000(cleanBase(BASE_URL));

    if (!isAbsolute && !base) {
        throw new Error(
            "NEXT_PUBLIC_AZURACAST_BASE_URL is not set. Please configure it in your environment."
        );
    }

    return isAbsolute ? removePort3000(path) : `${base}${path}`;
}

export function fixUrl(url: string | undefined): string | undefined {
    if (!url) return url;
    if (url.startsWith("http")) return url;
    return resolveUrl(url);
}

export function fixPodcast(podcast: Podcast): Podcast {
    return {
        ...podcast,
        art: fixUrl(podcast.art) || "",
        links: {
            ...podcast.links,
            public_feed: fixUrl(podcast.links?.public_feed) || "",
        },
    };
}

export function fixEpisode(episode: PodcastEpisode): PodcastEpisode {
    return {
        ...episode,
        art: fixUrl(episode.art) || "",
        links: {
            ...episode.links,
            public: fixUrl(episode.links?.public) || "",
            download: fixUrl(episode.links?.download) || "",
            self: fixUrl(episode.links?.self) || "",
        },
    };
}

export function fixStreamer(streamer: Streamer): Streamer {
    return {
        ...streamer,
        art: fixUrl(streamer.art) || "",
        links: {
            ...streamer.links,
            art: fixUrl(streamer.links?.art) || "",
            self: fixUrl(streamer.links?.self) || "",
            broadcasts: fixUrl(streamer.links?.broadcasts) || "",
            broadcasts_batch: fixUrl(streamer.links?.broadcasts_batch) || "",
        },
    };
}

export async function apiGet<T>(path: string): Promise<T> {
    const fullUrl = resolveUrl(path);
    // console.log(`Fetching: ${fullUrl}`);

    const res = await fetch(fullUrl, { cache: "no-store" });
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(
            `AzuraCast API GET ${path} failed: ${res.status} ${msg}`
        );
    }

    return res.json() as Promise<T>;
}
