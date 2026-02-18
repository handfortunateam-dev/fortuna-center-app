"use client";

import CardWrapper from "@/components/wrappers/card-wrappers";
import ListItemMotion from "@/components/motion/ListItemMotion";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";
import { useClasses } from "@/services/classesService";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  getPastBroadcasts,
  getCurrentBroadcasts,
} from "@/services/youtubeService";
import { Skeleton, Tabs, Tab, Badge } from "@heroui/react";
import { useState, useMemo } from "react";
import Image from "next/image";

interface RecentSessionsProps {
  limit?: number;
}

const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_GC_TIME = 1000 * 60 * 10; // 10 minutes

// Skeleton loading component
const ActivityLogSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-3 rounded-xl bg-default-50 border border-default-200"
      >
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

export default function RecentSessions({ limit = 5 }: RecentSessionsProps) {
  const [activeType, setActiveType] = useState<"classes" | "broadcasts">(
    "classes",
  );
  const broadcastChannelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "";

  // Stabilize parameters
  const classesParams = useMemo(
    () => ({
      limit: limit,
      // page is not supported by ClassListParams based on interface
    }),
    [limit],
  );

  // LMS Classes
  const { data: classesResponse, isLoading: lmsLoading } =
    useClasses(classesParams);

  // YouTube Broadcasts
  const { data: liveYT, isLoading: liveYTLoading } = useQuery({
    queryKey: ["yt-live", broadcastChannelId],
    queryFn: () => getCurrentBroadcasts(broadcastChannelId),
    enabled: activeType === "broadcasts" && !!broadcastChannelId,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  });

  const { data: pastYT, isLoading: pastYTLoading } = useQuery({
    queryKey: ["yt-past", broadcastChannelId],
    queryFn: () => getPastBroadcasts(broadcastChannelId),
    enabled: activeType === "broadcasts" && !!broadcastChannelId,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  });

  const recentClasses = classesResponse?.data || [];
  const broadcasts = [...(liveYT || []), ...(pastYT || [])].slice(0, limit);

  return (
    <CardWrapper
      title="Activity Logs"
      description="Latest learning and streaming activities"
      titleSize="xl"
      className="h-full"
      headerPadding="p-6 pb-0"
    >
      <div className="mb-0 flex justify-end">
        <Tabs
          selectedKey={activeType}
          onSelectionChange={(key) =>
            setActiveType(key as "classes" | "broadcasts")
          }
          size="sm"
          color="primary"
          variant="bordered"
          radius="lg"
        >
          <Tab key="classes" title="LMS Classes" />
          <Tab key="broadcasts" title="Broadcasts" />
        </Tabs>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {activeType === "classes" && (
          <>
            {lmsLoading ? (
              <ActivityLogSkeleton />
            ) : recentClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-default-400 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
                <Icon
                  icon="solar:clipboard-list-broken"
                  className="text-4xl mb-2"
                />
                <Text size="sm">No recent classes found</Text>
              </div>
            ) : (
              recentClasses.map((session, idx) => (
                <ListItemMotion
                  key={session.id}
                  index={idx}
                  className="flex items-center gap-4 p-3 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 transition-all group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.isActive ? "bg-blue-500/10" : "bg-default-200/50"}`}
                  >
                    <Icon
                      icon={
                        session.isActive
                          ? "solar:play-circle-bold"
                          : "solar:stop-circle-bold"
                      }
                      className={`text-2xl ${session.isActive ? "text-blue-500" : "text-default-400"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Heading
                      as="h3"
                      size="base"
                      className="font-semibold line-clamp-1"
                    >
                      {session.name}
                    </Heading>
                    <div className="flex items-center gap-2">
                      LMS
                      <span className="text-xs text-default-400">
                        Code: {session.code}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-default-400 block mb-1">
                      {formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {session.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold uppercase animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                </ListItemMotion>
              ))
            )}
          </>
        )}

        {activeType === "broadcasts" && (
          <>
            {liveYTLoading || pastYTLoading ? (
              <ActivityLogSkeleton />
            ) : broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-default-400 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
                <Icon
                  icon="solar:videocamera-record-broken"
                  className="text-4xl mb-2"
                />
                <Text size="sm">No broadcasts found</Text>
              </div>
            ) : (
              broadcasts.map((video, idx) => {
                const isLive = video.snippet.liveBroadcastContent === "live";
                const thumbnailUrl =
                  video.snippet.thumbnails.medium?.url ||
                  video.snippet.thumbnails.default?.url ||
                  "";

                return (
                  <ListItemMotion
                    key={video.id.videoId}
                    index={idx}
                    className="flex items-center gap-4 p-3 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 transition-all group cursor-pointer"
                  >
                    <div className="relative w-16 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-default-200">
                      {thumbnailUrl && (
                        <Image
                          src={thumbnailUrl}
                          alt={video.snippet.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      {isLive && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center z-10">
                          <Icon
                            icon="solar:play-bold"
                            className="text-white drop-shadow-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Heading
                        as="h3"
                        size="sm"
                        className="font-semibold line-clamp-1"
                      >
                        {video.snippet.title}
                      </Heading>
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          variant="flat"
                          color="danger"
                          className="text-[10px] h-4"
                        >
                          YT
                        </Badge>
                        <span className="text-[10px] text-default-400">
                          {formatDistanceToNow(
                            new Date(video.snippet.publishedAt),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>
                    </div>
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Live
                        </span>
                      </div>
                    )}
                  </ListItemMotion>
                );
              })
            )}
          </>
        )}
      </div>
    </CardWrapper>
  );
}
