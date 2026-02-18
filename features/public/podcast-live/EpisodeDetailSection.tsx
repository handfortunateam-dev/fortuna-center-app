"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Icon } from "@iconify/react";
import {
  Button,
  Avatar,
  Chip,
  Tooltip,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { useAudioPlayer } from "@/providers/AudioPlayerContext";
import {
  PodcastShowDetail,
  PodcastEpisodeDetail,
} from "@/features/podcast-cms/interfaces";
import { ShareButton } from "@/components/share-button/ShareButton";
import EpisodeComments from "./EpisodeComments";
import {
  useCheckEpisodeLikeStatus,
  useToggleEpisodeLike,
} from "@/services/podcastService";
import { useGetIdentity } from "@/hooks/useGetIdentity";
import { v4 as uuidv4 } from "uuid";

interface EpisodeDetailSectionProps {
  podcast: PodcastShowDetail;
  episode: PodcastEpisodeDetail;
}

export default function EpisodeDetailSection({
  podcast,
  episode,
}: EpisodeDetailSectionProps) {
  const {
    playingEpisode,
    isPlaying,
    playEpisode,
    pauseEpisode,
    resumeEpisode,
  } = useAudioPlayer();
  const { user, localUser } = useGetIdentity();

  // Visitor ID for likes
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    let vid = localStorage.getItem("podcast_visitor_id");
    if (!vid) {
      vid = uuidv4();
      localStorage.setItem("podcast_visitor_id", vid);
    }
    setVisitorId(vid);
  }, []);

  const userId = user?.id || localUser?.id;
  // If user is logged in, we can use their ID for liking too, but the API might expect 'visitorId' param.
  // The service passes { episodeId, visitorId }.
  // If backend handles authenticated user from session, visitorId might be fallback.
  // Let's pass visitorId always.

  const { data: likeStatus } = useCheckEpisodeLikeStatus(episode.id, visitorId);
  const toggleLike = useToggleEpisodeLike();

  const isLiked = likeStatus?.liked || false;
  // Optimistic update could be done but let's rely on query invalidation for now or local state if simple.

  const handlePlay = () => {
    if (playingEpisode?.id === episode.id) {
      if (isPlaying) {
        pauseEpisode();
      } else {
        resumeEpisode();
      }
    } else {
      playEpisode(
        {
          id: episode.id,
          title: episode.title,
          art: episode.thumbnailUrl || podcast.coverImage || null,
          audioUrl: episode.audioUrl,
        },
        {
          id: podcast.id,
          title: podcast.title,
        },
      );
    }
  };

  const handleLike = () => {
    if (!visitorId) return;
    toggleLike.mutate({ episodeId: episode.id, visitorId });
  };

  const isCurrentEpisode = playingEpisode?.id === episode.id;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white pb-20">
      {/* Header / Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          {(episode.thumbnailUrl || podcast.coverImage) && (
            <Image
              src={episode.thumbnailUrl || podcast.coverImage || ""}
              alt="Background"
              fill
              className="object-cover opacity-20 blur-3xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-900" />
        </div>

        <div className="relative z-10 px-6 py-12 md:py-20 max-w-5xl mx-auto">
          <Breadcrumbs
            variant="solid"
            className="text-gray-200 mb-8"
            classNames={{
              list: "bg-white/10 backdrop-blur-sm",
            }}
          >
            <BreadcrumbItem>
              <Link href="/podcast-list">Podcasts</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href={`/podcast-list/${podcast.slug}`}>
                {podcast.title}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>{episode.title}</BreadcrumbItem>
          </Breadcrumbs>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="shrink-0 relative group">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl relative bg-gray-800">
                {episode.thumbnailUrl || podcast.coverImage ? (
                  <Image
                    src={episode.thumbnailUrl || podcast.coverImage || ""}
                    alt={episode.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Icon icon="lucide:mic" className="w-16 h-16" />
                  </div>
                )}

                {/* Play Overlay */}
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentEpisode && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <Button
                    isIconOnly
                    radius="full"
                    size="lg"
                    className="w-16 h-16 bg-white text-black hover:scale-105"
                    onPress={handlePlay}
                  >
                    <Icon
                      icon={
                        isCurrentEpisode && isPlaying
                          ? "lucide:pause"
                          : "lucide:play"
                      }
                      className="w-8 h-8 fill-current"
                    />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-sm text-gray-300">
                  <span>
                    {format(
                      new Date(episode.publishedAt || Date.now()),
                      "MMM d, yyyy",
                    )}
                  </span>
                  <span>•</span>
                  <span>{Math.floor((episode.duration || 0) / 60)} min</span>
                  {episode.seasonNumber && (
                    <span>
                      • S{episode.seasonNumber} E{episode.episodeNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  {episode.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <Button
                  size="lg"
                  color="primary"
                  radius="full"
                  startContent={
                    <Icon
                      icon={
                        isCurrentEpisode && isPlaying
                          ? "lucide:pause"
                          : "lucide:play"
                      }
                      className="w-5 h-5 fill-current"
                    />
                  }
                  onPress={handlePlay}
                  className="font-bold px-8"
                >
                  {isCurrentEpisode && isPlaying ? "Pause" : "Play Episode"}
                </Button>

                <Button
                  radius="full"
                  variant="bordered"
                  className={`border-white/30 text-white hover:bg-white/10 ${isLiked ? "text-red-500 border-red-500/50 bg-red-500/10" : ""}`}
                  startContent={
                    <Icon
                      icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                      className={isLiked ? "text-red-500" : ""}
                    />
                  }
                  onPress={handleLike}
                  isLoading={toggleLike.isPending}
                >
                  {likeStatus?.likeCount || episode.likeCount || 0} Likes
                </Button>

                <ShareButton
                  url={`/podcast-list/${podcast.slug}/${episode.slug}`}
                  title={episode.title}
                  text={`Listen to ${episode.title} from ${podcast.title}`}
                  variant="bordered"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Show Notes</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {episode.description || "No description available."}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <EpisodeComments episodeId={episode.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-lg mb-4">About the Show</h4>
            <div className="flex items-center gap-4 mb-4">
              {podcast.coverImage && (
                <Image
                  src={podcast.coverImage}
                  alt={podcast.title}
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              )}
              <div>
                <Link
                  href={`/podcast-list/${podcast.slug}`}
                  className="font-bold hover:underline line-clamp-1"
                >
                  {podcast.title}
                </Link>
                <p className="text-sm text-gray-500">
                  by {podcast.author?.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 mb-4 whitespace-pre-line">
              {podcast.description || ""}
            </p>
            <Button
              as={Link}
              href={`/podcast-list/${podcast.slug}`}
              fullWidth
              variant="flat"
            >
              View All Episodes
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
