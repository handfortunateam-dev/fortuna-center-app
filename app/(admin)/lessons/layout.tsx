import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson Materials",
};

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
