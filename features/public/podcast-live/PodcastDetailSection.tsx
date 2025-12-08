"use client";

import { Icon } from "@iconify/react";
import { ShareButton } from "@/components/ui/ShareButton";
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
} from "@heroui/react";
import PodcastPagination from "@/features/public/podcast-live/PodcastPagination";
import type { Podcast, PodcastEpisode } from "@/services/azurecast/interfaces";

interface PodcastDetailSectionProps {
  podcast: Podcast;
  episodes: PodcastEpisode[];
  totalPages: number;
  currentPage: number;
  podcastId: string;
  query?: string;
}

export function PodcastDetailSection({
  podcast,
  episodes,
  totalPages,
  currentPage,
  podcastId,
  query,
}: PodcastDetailSectionProps) {
  const {
    playingEpisode,
    isPlaying,
    playEpisode,
    pauseEpisode,
    resumeEpisode,
  } = useAudioPlayer();

  const handlePlay = (episode: PodcastEpisode) => {
    if (playingEpisode?.id === episode.id) {
      if (isPlaying) {
        pauseEpisode();
      } else {
        resumeEpisode();
      }
    } else {
      playEpisode(episode, podcast);
    }
  };
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-red-950 to-red-800 dark:to-gray-900 text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0">
              {podcast.art ? (
                <Avatar
                  src={podcast.art}
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
                  by {podcast.author}
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
                  {podcast.language_name}
                </Chip>
                {podcast.categories?.map((cat) => (
                  <Chip
                    key={cat.category}
                    variant="flat"
                    color="danger"
                    classNames={{
                      base: "bg-red-700/50 backdrop-blur-sm border border-red-500/30",
                      content: "text-white font-semibold",
                    }}
                    size="sm"
                  >
                    {cat.text}
                  </Chip>
                ))}
              </div>

              <div
                className="text-white/90 text-sm leading-relaxed max-w-3xl"
                dangerouslySetInnerHTML={{ __html: podcast.description }}
              />

              {podcast.links?.public_feed && (
                <div className="pt-2 flex gap-2">
                  <ShareButton
                    title={podcast.title}
                    text={`Check out this podcast: ${podcast.title}`}
                    url={`/podcast-list/${podcastId}`}
                    variant="solid"
                    className="bg-white/20 text-white hover:bg-white/30"
                  />
                  <Button
                    as="a"
                    href={podcast.links.public_feed}
                    target="_blank"
                    rel="noreferrer"
                    color="default"
                    variant="solid"
                    startContent={
                      <Icon icon="lucide:rss" className="w-4 h-4" />
                    }
                    className="bg-white text-red-900 font-bold"
                  >
                    RSS Feed
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
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
                      {episode.art ? (
                        <Avatar
                          src={episode.art}
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
                          {format(
                            new Date(episode.publish_at * 1000),
                            "MMM d, yyyy"
                          )}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:clock" className="w-3 h-3" />
                          {format(
                            new Date(episode.publish_at * 1000),
                            "h:mm a"
                          )}
                        </span>
                      </div>
                      {episode.description_short && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {episode.description_short}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <Button
                        as={Link}
                        href={episode.links.public}
                        target="_blank"
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
                  podcastId={podcastId}
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
