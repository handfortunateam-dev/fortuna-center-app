import React from "react";
import YouTubePublicGallery from "@/features/public/home/YouTubePublicGallery";

export const metadata = {
  title: "Live Broadcasts | Fortuna Center",
  description: "Watch our past live streams.",
};

export default function LivePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Live Broadcasts
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Archive of our live streaming sessions.
        </p>
      </div>

      {/* Force activeTab="live" */}
      <YouTubePublicGallery searchParams={{ tab: "live" }} />
    </div>
  );
}
