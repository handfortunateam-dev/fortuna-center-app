"use client";

import { Icon } from "@iconify/react";
import { ShareButton } from "@/components/share-button/ShareButton";
import { useAudioPlayer } from "@/providers/AudioPlayerContext";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Chip,
  Avatar,
  Breadcrumbs,
  BreadcrumbItem,
  Tabs,
  Tab,
} from "@heroui/react";
import PodcastPagination from "@/features/public/podcast-live/PodcastPagination";
import type {
  PodcastShowDetail,
  PodcastEpisodeDetail,
} from "@/features/podcast-cms/interfaces";
import type {
  PlayerEpisode,
  PlayerPodcast,
} from "@/providers/AudioPlayerContext";
import { useRouter, useSearchParams } from "next/navigation";

interface PodcastDetailSectionProps {
  podcast: PodcastShowDetail;
  episodes: PodcastEpisodeDetail[];
  totalPages: number;
  currentPage: number;
  query?: string;
  seasons?: number[];
  currentSeason?: number;
}

// Map to generic player types
function toPlayerEpisode(ep: PodcastEpisodeDetail): PlayerEpisode {
  return {
    id: ep.id,
    title: ep.title,
    art: ep.thumbnailUrl || null,
    audioUrl: ep.audioUrl,
  };
}

function toPlayerPodcast(p: PodcastShowDetail): PlayerPodcast {
  return {
    id: p.id,
    title: p.title,
  };
}

export function PodcastDetailSection({
  podcast,
  episodes,
  totalPages,
  currentPage,
  query,
  seasons = [],
  currentSeason,
}: PodcastDetailSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    playingEpisode,
    isPlaying,
    playEpisode,
    pauseEpisode,
    resumeEpisode,
  } = useAudioPlayer();

  const handlePlay = (episode: PodcastEpisodeDetail) => {
    if (playingEpisode?.id === episode.id) {
      if (isPlaying) {
        pauseEpisode();
      } else {
        resumeEpisode();
      }
    } else {
      playEpisode(toPlayerEpisode(episode), toPlayerPodcast(podcast));
    }
  };

  const handleSeasonChange = (key: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (key === "all") {
      params.delete("season");
    } else {
      params.set("season", key);
    }
    // Reset page to 1 when changing season
    params.set("page", "1");
    router.push(`/podcast-list/${podcast.slug}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-red-950 to-red-800 dark:to-gray-900 text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0">
              {podcast.coverImage ? (
                <Avatar
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-40 h-40 md:w-48 md:h-48"
                  radius="lg"
                  isBordered
                />
              ) : (
                <Avatar
                  icon={<Icon icon="lucide:mic-vocal" className="w-16 h-16" />}
                  className="w-40 h-40 md:w-48 md:h-48 bg-white/10 text-yellow-200"
                  radius="lg"
                />
              )}
            </div>

            <div className="flex-1 space-y-4">
              <Breadcrumbs
                variant="solid"
                className="text-gray-200"
                classNames={{
                  list: "bg-white/10 backdrop-blur-sm",
                }}
              >
                <BreadcrumbItem>
                  <Link href="/podcast-list">Podcasts</Link>
                </BreadcrumbItem>
                <BreadcrumbItem>{podcast.title}</BreadcrumbItem>
              </Breadcrumbs>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {podcast.title}
                </h1>
                <p className="text-yellow-200 text-lg mt-1">
                  by {podcast.author?.name || "Unknown Author"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip
                  variant="flat"
                  classNames={{
                    base: "bg-white/10 backdrop-blur-sm border border-white/10",
                    content: "text-white font-semibold",
                  }}
                  size="sm"
                >
                  {podcast.episodeCount} Episodes
                </Chip>
                {podcast.status === "published" && (
                  <Chip
                    variant="flat"
                    color="success"
                    classNames={{
                      base: "bg-green-700/50 backdrop-blur-sm border border-green-500/30",
                      content: "text-white font-semibold",
                    }}
                    size="sm"
                  >
                    Published
                  </Chip>
                )}
              </div>

              <p className="text-white/90 text-sm leading-relaxed max-w-3xl whitespace-pre-line">
                {podcast.description || ""}
              </p>

              <div className="pt-2 flex gap-2">
                <ShareButton
                  title={podcast.title}
                  text={`Check out this podcast: ${podcast.title}`}
                  url={`/podcast-list/${podcast.slug}`}
                  variant="solid"
                  className="bg-white/20 text-white hover:bg-white/30"
                />
                {/* Add RSS feed button logic later if implemented */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {seasons.length > 0 && (
            <div className="mb-6">
              <Tabs
                aria-label="Seasons"
                color="warning"
                variant="underlined"
                selectedKey={currentSeason ? String(currentSeason) : "all"}
                onSelectionChange={(key) => handleSeasonChange(key as string)}
              >
                <Tab key="all" title="All Episodes" />
                {seasons.map((season) => (
                  <Tab key={String(season)} title={`Season ${season}`} />
                ))}
              </Tabs>
            </div>
          )}

          <Card shadow="sm" className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-800">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Episodes
                </h2>
                <Chip color="danger" size="sm" variant="flat">
                  Page {currentPage}
                </Chip>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <form action="" className="flex-1 md:w-64">
                  <Input
                    type="text"
                    name="query"
                    placeholder="Search episodes..."
                    defaultValue={query}
                    startContent={
                      <Icon
                        icon="lucide:search"
                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      />
                    }
                    size="sm"
                    variant="bordered"
                    classNames={{
                      input: "text-sm",
                    }}
                  />
                </form>
                <Button isIconOnly variant="bordered" size="sm" title="Refresh">
                  <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {/* List Header */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>Episode Details</span>
                <span>Actions</span>
              </div>

              {/* Episodes List */}
              <div className="divide-y">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="px-6 py-5 flex gap-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group items-start"
                  >
                    <div className="shrink-0 pt-1">
                      <Button
                        onPress={() => handlePlay(episode)}
                        isIconOnly
                        color={
                          playingEpisode?.id === episode.id
                            ? "primary"
                            : "danger"
                        }
                        variant="solid"
                        radius="full"
                        aria-label={
                          playingEpisode?.id === episode.id && isPlaying
                            ? "Pause episode"
                            : "Play episode"
                        }
                        className="w-10 h-10"
                      >
                        <Icon
                          icon={
                            playingEpisode?.id === episode.id && isPlaying
                              ? "lucide:pause"
                              : "lucide:play"
                          }
                          className={
                            playingEpisode?.id === episode.id && isPlaying
                              ? "w-5 h-5"
                              : "w-5 h-5 ml-0.5"
                          }
                        />
                      </Button>
                    </div>

                    <div className="shrink-0 hidden sm:block">
                      {episode.thumbnailUrl ? (
                        <Avatar
                          src={episode.thumbnailUrl}
                          alt={episode.title}
                          className="w-16 h-16"
                          radius="lg"
                        />
                      ) : (
                        <Avatar
                          icon={
                            <Icon icon="lucide:music" className="w-8 h-8" />
                          }
                          className="w-16 h-16 bg-gray-100 dark:bg-gray-800"
                          radius="lg"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                        {episode.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:calendar" className="w-3 h-3" />
                          {episode.publishedAt
                            ? format(
                                new Date(episode.publishedAt),
                                "MMM d, yyyy",
                              )
                            : "Unpublished"}
                        </span>
                        {episode.duration && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Icon icon="lucide:clock" className="w-3 h-3" />
                              {Math.floor(episode.duration / 60)}:
                              {(episode.duration % 60)
                                .toString()
                                .padStart(2, "0")}
                            </span>
                          </>
                        )}
                        {episode.seasonNumber && (
                          <>
                            <span>•</span>
                            <span>
                              S{episode.seasonNumber} E{episode.episodeNumber}
                            </span>
                          </>
                        )}
                      </div>
                      {episode.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 whitespace-pre-line">
                          {episode.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <Button
                        as={Link}
                        href={`/podcast-list/${podcast.slug}/${episode.slug}`}
                        variant="bordered"
                        size="sm"
                        endContent={
                          <Icon
                            icon="lucide:external-link"
                            className="w-3 h-3"
                          />
                        }
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}

                {episodes.length === 0 && (
                  <div className="text-center py-16">
                    <Avatar
                      icon={<Icon icon="lucide:search-x" className="w-6 h-6" />}
                      className="w-12 h-12 bg-gray-100 dark:bg-gray-800 mb-3 mx-auto"
                    />
                    <h3 className="text-gray-900 dark:text-white font-medium">
                      No episodes found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Try adjusting your search terms.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Pagination */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {totalPages}
                  </span>
                </div>

                <PodcastPagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  podcastId={podcast.slug}
                  query={query}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
