import React from "react";
import { getVideoDetails } from "@/services/youtubeService";
import LiveStreamPlayer from "@/features/public/live/LiveStreamPlayer";
import { Metadata } from "next";

interface LiveStreamPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export async function generateMetadata({
  params,
}: LiveStreamPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideoDetails(videoId);
  return {
    title: video
      ? `${video.snippet.title} | Live Stream`
      : "Live Stream | Fortuna Center",
    description:
      video?.snippet.description?.slice(0, 160) || "Watch our live broadcast.",
  };
}

export default async function LiveStreamPage({ params }: LiveStreamPageProps) {
  const { videoId } = await params;
  const video = await getVideoDetails(videoId);

  return (
    <div className="container mx-auto px-4 py-6">
      <LiveStreamPlayer
        videoId={videoId}
        title={video?.snippet.title}
        description={video?.snippet.description}
        publishedAt={video?.snippet.publishedAt}
        channelId={video?.snippet.channelId}
      />
    </div>
  );
}
