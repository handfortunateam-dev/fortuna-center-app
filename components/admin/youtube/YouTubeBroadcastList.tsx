"use client";

import React from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { format } from "date-fns";
import { YouTubeLiveBroadcast } from "@/services/youtubeService";
import { Image } from "@heroui/react";

interface YouTubeBroadcastListProps {
  broadcasts?: YouTubeLiveBroadcast[];
  error?: string;
  needsAuth?: boolean;
  authUrl?: string;
}

export default function YouTubeBroadcastList({
  broadcasts = [],
  error = "",
  needsAuth = false,
  authUrl = "",
}: YouTubeBroadcastListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            YouTube Live Broadcasts
          </h1>
          <p className="text-gray-500">
            Manage and view your YouTube live streams.
          </p>
        </div>
        {needsAuth && (
          <Button
            as={Link}
            href={authUrl}
            color="danger"
            startContent={<Icon icon="logos:youtube-icon" />}
          >
            Connect YouTube Account
          </Button>
        )}
        {!needsAuth && (
          <Button
            as={Link}
            href="/api/auth/callback/google?logout=true"
            color="default"
            variant="flat"
            startContent={<Icon icon="lucide:log-out" />}
          >
            Reconnect / Logout
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!needsAuth && broadcasts.length === 0 && !error && (
        <Card>
          <CardBody className="py-8 text-center text-gray-500">
            <Icon
              icon="lucide:video-off"
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>No live broadcasts found.</p>
            <p className="text-sm">
              Create a live stream on YouTube Studio first.
            </p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {broadcasts.map((broadcast) => (
          <Card key={broadcast.id} className="w-full">
            <CardBody className="p-0">
              <div className="relative aspect-video bg-black">
                {broadcast.snippet.thumbnails.medium?.url ? (
                  <Image
                    src={broadcast.snippet.thumbnails.medium.url}
                    alt={broadcast.snippet.title}
                    className="w-full h-full object-cover"
                    removeWrapper
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <Icon icon="lucide:image-off" className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10">
                  <Chip
                    color={
                      broadcast.status.lifeCycleStatus === "live"
                        ? "success"
                        : broadcast.status.lifeCycleStatus === "complete"
                        ? "default"
                        : "primary"
                    }
                    variant="solid"
                    size="sm"
                  >
                    {broadcast.status.lifeCycleStatus.toUpperCase()}
                  </Chip>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h3
                  className="font-semibold line-clamp-2"
                  title={broadcast.snippet.title}
                >
                  {broadcast.snippet.title}
                </h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="w-4 h-4" />
                    <span>
                      Created:{" "}
                      {format(new Date(broadcast.snippet.publishedAt), "PPP")}
                    </span>
                  </div>
                  {broadcast.snippet.scheduledStartTime && (
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:clock" className="w-4 h-4" />
                      <span>
                        Scheduled:{" "}
                        {format(
                          new Date(broadcast.snippet.scheduledStartTime),
                          "PP p"
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    as={Link}
                    href={`https://studio.youtube.com/video/${broadcast.id}/livestreaming`}
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
                    href={`https://www.youtube.com/watch?v=${broadcast.id}`}
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
    </div>
  );
}
