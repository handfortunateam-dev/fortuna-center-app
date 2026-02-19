import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog & Articles",
  description:
    "Read the latest articles on English learning tips, career development, broadcasting, and program updates from Fortuna Center Kupang.",
  alternates: {
    canonical: "https://www.fortunacenter.com/blog",
  },
  openGraph: {
    title: "Blog & Articles | Fortuna Center Kupang",
    description:
      "English learning tips, career development insights, and the latest program updates from Fortuna Center Kupang.",
    url: "https://www.fortunacenter.com/blog",
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
