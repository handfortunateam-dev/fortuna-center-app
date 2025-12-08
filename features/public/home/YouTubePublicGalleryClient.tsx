"use client";

import React, { useState } from "react";
import { YouTubeVideo, YouTubePlaylist } from "@/services/youtubeService";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { format } from "date-fns";

// Props interfaces for the display components
interface VideoCardProps {
  video: YouTubeVideo;
  onPlay?: (videoId: string) => void;
  href?: string;
}

interface PlaylistCardProps {
  playlist: YouTubePlaylist;
}

function VideoCard({ video, onPlay, href }: VideoCardProps) {
  const handlePress = () => {
    if (href) return; // Allow default Link behavior if wrapped or handled
    if (onPlay) onPlay(video.id.videoId);
  };

  const Content = (
    <>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
      {video.snippet.thumbnails.medium?.url ? (
        <img
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <Icon icon="lucide:image-off" className="w-10 h-10 text-zinc-400" />
        </div>
      )}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg">
          <Icon icon="lucide:play" className="w-6 h-6 fill-current ml-1" />
        </div>
      </div>
    </>
  );

  return (
    <Card className="w-full h-full border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900">
      <CardBody
        className="p-0 relative aspect-video group cursor-pointer"
        onClick={href ? undefined : handlePress}
      >
        {href ? (
          <Link
            href={href}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            {/* Transparent overlay for link to work on top of images */}
          </Link>
        ) : null}
        {Content}
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <h3
          className="font-semibold text-lg line-clamp-2 leading-tight text-gray-900 dark:text-gray-100"
          title={video.snippet.title}
        >
          {href ? (
            <Link href={href} className="hover:text-red-600 transition-colors">
              {video.snippet.title}
            </Link>
          ) : (
            video.snippet.title
          )}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 w-full">
          <Icon icon="lucide:calendar" className="w-3 h-3" />
          <span>{format(new Date(video.snippet.publishedAt), "PPP")}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Card className="w-full h-full border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 group">
      <CardBody className="p-0 relative aspect-video">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
          <span className="text-xl font-bold">
            {playlist.contentDetails.itemCount}
          </span>
          <span className="text-xs uppercase tracking-wider mt-1">Videos</span>
          <Icon icon="lucide:list-video" className="w-6 h-6 mt-2 opacity-80" />
        </div>
        {playlist.snippet.thumbnails.medium?.url ? (
          <img
            src={playlist.snippet.thumbnails.medium.url}
            alt={playlist.snippet.title}
            className="w-full h-full object-cover pr-[33%]"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 pr-[33%]" />
        )}
        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <Button
            variant="ghost"
            radius="full"
            as={Link}
            href={`https://www.youtube.com/playlist?list=${playlist.id}`}
            target="_blank"
            className="text-white border-white hover:bg-white/20"
          >
            View Playlist
          </Button>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col items-start p-4">
        <h3
          className="font-semibold text-base line-clamp-1"
          title={playlist.snippet.title}
        >
          {playlist.snippet.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
          {playlist.snippet.description || "No description"}
        </p>
      </CardFooter>
    </Card>
  );
}

interface YouTubePublicGalleryProps {
  videos: YouTubeVideo[];
  playlists: YouTubePlaylist[];
  liveBroadcasts: YouTubeVideo[];
  currentBroadcasts?: YouTubeVideo[];
  channelId: string;
  activeTab?: string;
}

export default function YouTubePublicGalleryClient({
  videos,
  playlists,
  liveBroadcasts,
  currentBroadcasts = [],
  channelId,
  activeTab = "all",
}: YouTubePublicGalleryProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handlePlay = (videoId: string) => {
    setPlayingVideoId(videoId);
    onOpen();
  };

  const handleClose = () => {
    setPlayingVideoId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "playlists":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Icon icon="lucide:list-video" />
              <span>Playlists</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
              {playlists.length === 0 && (
                <p className="text-gray-500 col-span-4 text-center py-8">
                  No playlists found.
                </p>
              )}
            </div>
          </div>
        );
      case "live":
        return (
          <div className="space-y-12">
            {currentBroadcasts.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-red-600">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span>Currently Live</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBroadcasts.map((video) => (
                    <VideoCard
                      key={video.id.videoId}
                      video={video}
                      href={`/video-gallery/live/${video.id.videoId}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Icon icon="lucide:history" />
                <span>Past Broadcasts</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveBroadcasts.map((video) => (
                  <VideoCard
                    key={video.id.videoId}
                    video={video}
                    onPlay={handlePlay}
                  />
                ))}
                {liveBroadcasts.length === 0 && (
                  <p className="text-gray-500 col-span-3 text-center py-8">
                    No past live broadcasts found.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case "all":
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Icon icon="lucide:grid" />
              <span>All Videos</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id.videoId}
                  video={video}
                  onPlay={handlePlay}
                />
              ))}
              {videos.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center py-8">
                  No videos found.
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <section className="space-y-8">
      {renderContent()}

      <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-gray-800">
        <Button
          as={Link}
          href={`https://youtube.com/channel/${channelId}/videos`}
          target="_blank"
          variant="flat"
          color="danger"
          startContent={<Icon icon="logos:youtube-icon" />}
          endContent={<Icon icon="lucide:external-link" />}
        >
          Visit Official YouTube Channel
        </Button>
      </div>

      {/* Video Player Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
          onOpenChange();
        }}
        size="4xl"
        backdrop="blur"
        classNames={{
          body: "p-0",
          base: "bg-black/90 border-none",
          header: "hidden", // Hide header as requested by lint
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="relative aspect-video w-full bg-black flex items-center justify-center rounded-lg overflow-hidden">
                  {playingVideoId && (
                    <iframe
                      src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      title="YouTube Video Player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {!playingVideoId && (
                    <div className="text-white">Loading...</div>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
