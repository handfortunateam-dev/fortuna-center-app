import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Fortuna English & HRD Training Centre — our vision, mission, and journey to becoming a trusted training institution in Kupang, East Nusa Tenggara since 2019.",
  alternates: {
    canonical: "https://www.fortunacenter.com/about",
  },
  openGraph: {
    title: "About Us | Fortuna Center Kupang",
    description:
      "Discover the vision, mission, and story behind Fortuna Center — empowering minds and shaping futures in Kupang since 2019.",
    url: "https://www.fortunacenter.com/about",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
