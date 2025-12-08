import React from "react";
import YouTubePublicGallery from "@/features/public/home/YouTubePublicGallery";

export const metadata = {
  title: "Playlists | Fortuna Center",
  description: "Browse curated video playlists.",
};

export default function PlaylistsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Playlists
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Collections of videos curated for you.
        </p>
      </div>

      {/* Force activeTab="playlists" */}
      <YouTubePublicGallery searchParams={{ tab: "playlists" }} />
    </div>
  );
}
