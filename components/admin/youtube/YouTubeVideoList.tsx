"use client";

import React from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { format } from "date-fns";
import { YouTubeVideo } from "@/services/youtubeService";
import { Image } from "@heroui/react";

interface YouTubeVideoListProps {
  videos: YouTubeVideo[];
}

export default function YouTubeVideoList({ videos }: YouTubeVideoListProps) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardBody className="py-8 text-center text-gray-500">
          <Icon
            icon="lucide:video-off"
            className="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>No videos found.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card key={video.id.videoId} className="w-full">
          <CardBody className="p-0">
            <div className="relative aspect-video bg-black">
              {video.snippet.thumbnails.medium?.url ? (
                <Image
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover"
                  removeWrapper
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <Icon icon="lucide:image-off" className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <h3
                className="font-semibold line-clamp-2"
                title={video.snippet.title}
              >
                {video.snippet.title}
              </h3>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="w-4 h-4" />
                  <span>
                    {format(new Date(video.snippet.publishedAt), "PPP")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  as={Link}
                  href={`https://studio.youtube.com/video/${video.id.videoId}/edit`}
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
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
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
