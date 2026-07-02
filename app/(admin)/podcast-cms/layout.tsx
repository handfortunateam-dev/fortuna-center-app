import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast CMS",
};

export default function PodcastCMSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
