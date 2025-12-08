"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { YouTubeChannelStatistics } from "@/services/youtubeService";

interface YouTubeStatisticsClientProps {
  stats: YouTubeChannelStatistics | null;
}

export default function YouTubeStatisticsClient({
  stats,
}: YouTubeStatisticsClientProps) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load statistics. Check your API Key.
      </div>
    );
  }

  const statItems = [
    {
      label: "Subscribers",
      value: stats.subscriberCount,
      hidden: stats.hiddenSubscriberCount,
      icon: "lucide:users",
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Views",
      value: stats.viewCount,
      icon: "lucide:eye",
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Total Videos",
      value: stats.videoCount,
      icon: "lucide:video",
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">YouTube Channel Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((item, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className={`p-3 rounded-full ${item.bg}`}>
                <Icon icon={item.icon} className={`w-8 h-8 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold">
                  {item.hidden ? "Hidden" : Number(item.value).toLocaleString()}
                </h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon icon="lucide:info" className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Note
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              These statistics are retrieved directly from the YouTube Data API.
              The subscriber count might be rounded abbreviation (e.g., "1.2K")
              depending on the API response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
