import React from "react";
import { getPodcasts } from "@/services/azurecast/azuracastPrivateService";
import { Podcast } from "@/services/azurecast/interfaces";
import PodcastListClient from "./PodcastListClient";
import StorageQuotaWidget from "./StorageQuotaWidget";

export const dynamic = "force-dynamic";

export default async function Page() {
  let podcasts: Podcast[] = [];
  try {
    podcasts = await getPodcasts();
  } catch (error) {
    console.error("Failed to fetch podcasts:", error);
  }

  return (
    <>
      <PodcastListClient podcasts={podcasts} />
      <StorageQuotaWidget />
    </>
  );
}
