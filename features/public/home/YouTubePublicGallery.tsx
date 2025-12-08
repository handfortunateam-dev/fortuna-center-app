import React from "react";
import {
  getPastBroadcasts,
  getChannelPlaylists,
  getChannelVideos,
  getCurrentBroadcasts,
} from "@/services/youtubeService";
import YouTubePublicGalleryClient from "./YouTubePublicGalleryClient";

interface VideoGalleryPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function YouTubePublicGallery({
  searchParams,
}: VideoGalleryPageProps) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  // Determine active tab from URL query parameter ?tab=...
  // Default to 'all' if not specified or invalid
  const tabParam = searchParams?.tab;
  const activeTab = typeof tabParam === "string" ? tabParam : "all";

  if (!channelId) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center text-gray-500">
        Please set YOUTUBE_CHANNEL_ID in your .env file to view the gallery.
      </div>
    );
  }

  const [videos, playlists, liveBroadcasts, currentBroadcasts] =
    await Promise.all([
      getChannelVideos(channelId),
      getChannelPlaylists(channelId),
      getPastBroadcasts(channelId),
      getCurrentBroadcasts(channelId),
    ]);

  return (
    <YouTubePublicGalleryClient
      videos={videos}
      playlists={playlists}
      liveBroadcasts={liveBroadcasts}
      currentBroadcasts={currentBroadcasts}
      channelId={channelId}
      activeTab={activeTab}
    />
  );
}
