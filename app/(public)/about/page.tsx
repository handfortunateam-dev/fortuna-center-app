import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Fortuna English & HRD Training Centre, our vision, mission, and our journey in empowering minds in Kupang since 2019.",
  alternates: {
    canonical: "https://www.fortunacenter.com/about",
  },
};

export default function Page() {
  return <AboutClient />;
}
