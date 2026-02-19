import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Live Broadcast",
  description:
    "Watch Fortuna Center's live broadcast sessions — informative and educational programs streamed live from Kupang, East Nusa Tenggara.",
  alternates: {
    canonical: "https://www.fortunacenter.com/broadcast-live",
  },
  openGraph: {
    title: "Live Broadcast | Fortuna Center Kupang",
    description:
      "Watch Fortuna Center's live educational broadcast sessions from Kupang.",
    url: "https://www.fortunacenter.com/broadcast-live",
  },
};

export default function BroadcastLiveLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
