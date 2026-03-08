import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog & Stories",
  description:
    "Stay updated with the latest stories, English learning tips, and professional development insights from Fortuna Center Kupang.",
  alternates: {
    canonical: "https://www.fortunacenter.com/blog",
  },
};

export default function Page() {
  return <BlogClient />;
}
