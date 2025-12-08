import React from "react";
import { getChannelVideos } from "@/services/youtubeService";
import YouTubeVideoList from "@/components/admin/youtube/YouTubeVideoList";

export default async function AdminYouTubeVideosPage() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please set YOUTUBE_CHANNEL_ID in .env
      </div>
    );
  }

  const videos = await getChannelVideos(channelId);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage All Videos</h1>
      <YouTubeVideoList videos={videos} />
    </div>
  );
}
