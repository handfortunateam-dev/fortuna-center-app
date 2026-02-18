"use client";

import { use } from "react";
import ShowDetailWithEpisodes from "@/features/podcast-cms/ShowDetailWithEpisodes";

export default function PodcastShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ShowDetailWithEpisodes id={id} />;
}
