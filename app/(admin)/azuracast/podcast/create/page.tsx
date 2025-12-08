import React from "react";
import PodcastCreateForm from "./PodcastCreateForm";
import { getVuePodcastsData } from "@/services/azurecast/azuracastPrivateService";

export const dynamic = "force-dynamic";

export default async function Page() {
  let vueData;
  try {
    vueData = await getVuePodcastsData();
  } catch (error) {
    console.error("Failed to fetch vue podcasts data:", error);
  }

  return (
    <PodcastCreateForm
      languageOptions={vueData?.languageOptions || {}}
      categoriesOptions={vueData?.categoriesOptions || []}
    />
  );
}
