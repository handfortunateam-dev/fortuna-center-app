"use client";

import React from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { format } from "date-fns";
import { YouTubePlaylist } from "@/services/youtubeService";
import { Image } from "@heroui/react";

interface YouTubePlaylistListProps {
  playlists: YouTubePlaylist[];
}

export default function YouTubePlaylistList({
  playlists,
}: YouTubePlaylistListProps) {
  if (playlists.length === 0) {
    return (
      <Card>
        <CardBody className="py-8 text-center text-gray-500">
          <Icon
            icon="lucide:list-video"
            className="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>No playlists found.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {playlists.map((playlist) => (
        <Card key={playlist.id} className="w-full">
          <CardBody className="p-0">
            <div className="relative aspect-video bg-black">
              {playlist.snippet.thumbnails.medium?.url ? (
                <Image
                  src={playlist.snippet.thumbnails.medium.url}
                  alt={playlist.snippet.title}
                  className="w-full h-full object-cover"
                  removeWrapper
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <Icon icon="lucide:image-off" className="w-10 h-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Icon
                  icon="lucide:play-circle"
                  className="w-12 h-12 text-white"
                />
              </div>
              <div className="absolute bottom-2 right-2">
                <Chip
                  size="sm"
                  variant="solid"
                  color="default"
                  className="bg-black/80 text-white"
                >
                  {playlist.contentDetails.itemCount} videos
                </Chip>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h3
                className="font-semibold line-clamp-2"
                title={playlist.snippet.title}
              >
                {playlist.snippet.title}
              </h3>
              <p className="text-small text-gray-500 line-clamp-2">
                {playlist.snippet.description || "No description"}
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  as={Link}
                  href={`https://studio.youtube.com/channel/${playlist.snippet.channelId}/playlists`}
                  target="_blank"
                  variant="flat"
                  className="flex-1"
                >
                  Manage in Studio
                </Button>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  as={Link}
                  href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                  target="_blank"
                >
                  <Icon icon="lucide:external-link" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
