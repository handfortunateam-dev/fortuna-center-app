import React from "react";
import {
  getChannelStatistics,
  getChannelAnalytics,
  getAuthUrl,
} from "@/services/youtubeService";
import YouTubeStatisticsClient from "@/components/admin/youtube/YouTubeStatisticsClient";
import YouTubeAnalyticsWrapper from "@/components/admin/youtube/YouTubeAnalyticsWrapper";
import { cookies } from "next/headers";
import { subDays, format } from "date-fns";

export default async function YouTubeStatisticsPage() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  // Get cookies for authentication
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("youtube_access_token")?.value;

  if (!channelId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please set YOUTUBE_CHANNEL_ID in .env
      </div>
    );
  }

  // Fetch Public Stats (API Key)
  const stats = await getChannelStatistics(channelId);

  // Fetch Analytics (OAuth) - Only if access token exists
  let analyticsData = null;
  let authUrl = "";

  if (accessToken) {
    // Last 30 days
    const endDate = format(new Date(), "yyyy-MM-dd");
    const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
    analyticsData = await getChannelAnalytics(accessToken, startDate, endDate);
  } else {
    authUrl = await getAuthUrl();
  }

  return (
    <div className="flex flex-col gap-8">
      <YouTubeStatisticsClient stats={stats} />

      <YouTubeAnalyticsWrapper
        analyticsData={analyticsData}
        isAuthenticated={!!accessToken}
        authUrl={authUrl}
      />
    </div>
  );
}
