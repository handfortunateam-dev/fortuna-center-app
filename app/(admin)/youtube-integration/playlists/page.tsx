import React from "react";
import { getChannelPlaylists } from "@/services/youtubeService";
import YouTubePlaylistList from "@/components/admin/youtube/YouTubePlaylistList";

export default async function AdminYouTubePlaylistsPage() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please set YOUTUBE_CHANNEL_ID in .env
      </div>
    );
  }

  const playlists = await getChannelPlaylists(channelId);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Playlists</h1>
      <YouTubePlaylistList playlists={playlists} />
    </div>
  );
}
