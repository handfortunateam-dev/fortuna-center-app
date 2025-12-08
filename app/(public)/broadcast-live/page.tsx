import {
  getHlsInfo,
  getNowPlaying,
  getPodcastEpisodes,
  getPodcasts,
  getStationDetail,
  getStreams,
} from "@/services/azurecast/azuracastService";
import type { Podcast, PodcastEpisode } from "@/services/azurecast/interfaces";
import { Icon } from "@iconify/react";
import { ShareButton } from "@/components/ui/ShareButton";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 30;

async function getPodcastEpisodeMap(podcasts: Podcast[]) {
  const limited = podcasts.slice(0, 3);
  const entries = await Promise.all(
    limited.map(async (podcast) => {
      try {
        const response = await getPodcastEpisodes(podcast.id);
        const rows = response.rows ?? [];
        return [podcast.id, rows.slice(0, 3)] as const;
      } catch {
        return [podcast.id, []] as [string, PodcastEpisode[]];
      }
    })
  );
  return new Map<string, PodcastEpisode[]>(entries);
}

const AZURACAST_BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || "";

const resolveStreamUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = AZURACAST_BASE_URL.replace(/\/+$/, "");
  if (!base) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

export default async function BroadcastLivePage() {
  const [
    stationResult,
    nowPlayingResult,
    streamsResult,
    hlsResult,
    podcastsResult,
  ] = await Promise.allSettled([
    getStationDetail(),
    getNowPlaying(),
    getStreams(),
    getHlsInfo(),
    getPodcasts(),
  ]);

  const station =
    stationResult.status === "fulfilled" ? stationResult.value : null;
  const nowPlaying =
    nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : null;
  const streams =
    streamsResult.status === "fulfilled" ? streamsResult.value : [];
  const hlsInfo = hlsResult.status === "fulfilled" ? hlsResult.value : null;
  const podcasts =
    podcastsResult.status === "fulfilled" ? podcastsResult.value : [];

  const streamUrl = resolveStreamUrl(
    station?.listen_url ||
      streams.find((stream) => stream.is_default)?.url ||
      streams[0]?.url ||
      ""
  );

  const episodesByPodcast = await getPodcastEpisodeMap(podcasts);
  const nowPlayingUpdated =
    nowPlaying?.now_playing.played_at && nowPlaying.now_playing.played_at > 0
      ? formatDistanceToNow(nowPlaying.now_playing.played_at * 1000, {
          addSuffix: true,
        })
      : "moments ago";

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors">
      <section className="bg-gradient-to-b from-red-900 via-red-800 to-yellow-900 dark:from-red-950 dark:via-red-900 dark:to-yellow-950 text-white px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-yellow-200">
              Fortuna Broadcast Center
            </p>
            <h1 className="text-4xl font-semibold">
              {station?.name || "Live Broadcast"}
            </h1>
            <p className="text-yellow-100 max-w-3xl">
              {station?.description ||
                "Streaming our latest shows, music, and student-led programming 24/7."}
            </p>
          </div>

          {streamUrl && (
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-sm uppercase text-yellow-200 tracking-wide">
                    {nowPlaying?.live?.is_live
                      ? "Live Broadcast"
                      : "Now Playing"}
                  </span>
                  <h2 className="text-2xl font-semibold">
                    {nowPlaying?.live?.is_live
                      ? nowPlaying.live.streamer_name
                      : nowPlaying?.now_playing.song.title || "Tuning in..."}
                  </h2>
                  <p className="text-yellow-100">
                    {nowPlaying?.live?.is_live
                      ? `${nowPlaying.now_playing.song.title} - ${nowPlaying.now_playing.song.artist}`
                      : nowPlaying?.now_playing.song.artist ||
                        "Fortuna Broadcast"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-yellow-100">
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:users" className="w-4 h-4" />
                    {nowPlaying?.listeners.current ?? 0} listening now
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:clock-3" className="w-4 h-4" />
                    Updated {nowPlayingUpdated}
                  </span>
                  <ShareButton
                    url="/broadcast-live"
                    title={station?.name || "Fortuna Broadcast Center"}
                    text={`Tune in to ${
                      nowPlaying?.live?.is_live
                        ? nowPlaying.live.streamer_name
                        : "Fortuna Broadcast"
                    } live!`}
                    variant="solid"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30"
                  />
                </div>
              </div>
              <audio controls src={streamUrl} className="w-full" preload="none">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </section>

      <section id="video" className="px-6 py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recently Played
            </h2>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
              {(nowPlaying?.song_history || []).slice(0, 6).map((entry) => (
                <div
                  key={`${entry.played_at}-${entry.song.title}`}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {entry.song.title}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.song.artist}
                    </span>
                  </div>
                  <time className="text-xs text-gray-400">
                    {formatDistanceToNow(entry.played_at * 1000, {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              ))}
              {!nowPlaying?.song_history?.length && (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  We&apos;ll populate this once songs start playing.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Stream Details
            </h2>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
              {streams.map((stream) => (
                <div key={stream.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stream.name}{" "}
                        {stream.is_default && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-semibold ml-1">
                            LIVE
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stream.format.toUpperCase()} • {stream.bitrate}kbps
                      </p>
                    </div>
                    <a
                      href={resolveStreamUrl(stream.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-500"
                    >
                      Listen{" "}
                      <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stream.listeners.current} listeners (peak{" "}
                    {stream.listeners.total})
                  </p>
                </div>
              ))}
              {!streams.length && (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  Stream mounts are not published yet.
                </div>
              )}
            </div>

            {hlsInfo?.enabled && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 space-y-2">
                <p className="text-sm uppercase tracking-wide text-red-700 dark:text-red-400 font-semibold">
                  HLS STREAM
                </p>
                <p className="text-gray-800 dark:text-gray-300 text-sm">
                  Adaptive streaming is available for modern players.
                </p>
                <a
                  href={hlsInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-sm"
                >
                  Open HLS Stream{" "}
                  <Icon icon="lucide:link" className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {!!podcasts.length && (
        <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
                On-demand
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Featured Podcasts
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Catch up on student shows, interviews, and storytelling from
                Fortuna Broadcast.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {podcasts.slice(0, 4).map((podcast) => {
                const episodes = episodesByPodcast.get(podcast.id) || [];
                return (
                  <div
                    key={podcast.id}
                    className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      {podcast.art ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={podcast.art}
                          alt={podcast.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <Icon icon="lucide:mic-vocal" className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm uppercase text-gray-400 dark:text-gray-500">
                          Podcast
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {podcast.title}
                        </h3>
                        {podcast.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {podcast.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {episodes.length ? (
                        episodes.map((episode) => (
                          <div
                            key={episode.id}
                            className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {episode.title}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                {formatDistanceToNow(
                                  episode.publish_at * 1000,
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                              <a
                                href={
                                  episode.links?.download ??
                                  episode.links?.public ??
                                  episode.links?.self ??
                                  "#"
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-red-600 dark:text-red-400"
                              >
                                Play{" "}
                                <Icon icon="lucide:play" className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Episodes will appear soon.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
