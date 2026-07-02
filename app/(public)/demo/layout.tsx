import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo",
  description: "Experience our live video and audio streaming demo.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
