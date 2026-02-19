import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "Listen to Fortuna Center's educational podcasts on English learning, self-development, and broadcasting — available free for everyone.",
  alternates: {
    canonical: "https://www.fortunacenter.com/podcast-list",
  },
  openGraph: {
    title: "Podcast | Fortuna Center Kupang",
    description:
      "Free educational podcasts from Fortuna Center — English tips, self-development, and broadcasting insights.",
    url: "https://www.fortunacenter.com/podcast-list",
  },
};

export default function PodcastListLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
