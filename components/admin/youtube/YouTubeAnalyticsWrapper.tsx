"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { YouTubeAnalyticsData } from "@/services/youtubeService";
import YouTubeAnalyticsCharts from "./YouTubeAnalyticsCharts";

interface YouTubeAnalyticsWrapperProps {
  analyticsData: YouTubeAnalyticsData | null;
  isAuthenticated: boolean;
  authUrl: string;
}

export default function YouTubeAnalyticsWrapper({
  analyticsData,
  isAuthenticated,
  authUrl,
}: YouTubeAnalyticsWrapperProps) {
  return (
    <div className="p-6 pt-0 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Channel Analytics (Last 30 Days)</h2>
        {!isAuthenticated && (
          <Button
            as={Link}
            href={authUrl}
            color="primary"
            startContent={<Icon icon="logos:youtube-icon" />}
          >
            Connect for Analytics
          </Button>
        )}
      </div>

      {analyticsData ? (
        <YouTubeAnalyticsCharts analyticsData={analyticsData} />
      ) : isAuthenticated ? (
        <div className="p-8 border border-dashed rounded-lg text-center text-gray-500">
          Failed to load analytics data, or no data available.
        </div>
      ) : (
        <div className="p-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-center">
          <Icon
            icon="solar:chart-2-bold-duotone"
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
          />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Analytics Locked
          </h3>
          <p className="text-gray-500 mb-6">
            Connect your YouTube account to view detailed performance charts.
          </p>
          <Button
            as={Link}
            href={authUrl}
            color="primary"
            startContent={<Icon icon="logos:youtube-icon" />}
          >
            Connect YouTube Account
          </Button>
        </div>
      )}
    </div>
  );
}
