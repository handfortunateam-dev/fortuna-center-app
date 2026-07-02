import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Broadcast Training Program",
  description:
    "Develop your broadcasting and public speaking skills with Fortuna Center's professional broadcast training program in Kupang. Learn from experienced instructors.",
  alternates: {
    canonical: "https://www.fortunacenter.com/programs/broadcast",
  },
  openGraph: {
    title: "Broadcast Training Program | Fortuna Center Kupang",
    description:
      "Professional broadcast and public speaking training in Kupang with experienced instructors at Fortuna Center.",
    url: "https://www.fortunacenter.com/programs/broadcast",
  },
};

export default function BroadcastProgramLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
