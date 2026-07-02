import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LMS Program — Online English Course",
  description:
    "Join Fortuna Center's Learning Management System (LMS) to improve your English online with experienced teachers, interactive lessons, and progress tracking.",
  alternates: {
    canonical: "https://www.fortunacenter.com/programs/lms",
  },
  openGraph: {
    title: "LMS Program | Fortuna Center Kupang",
    description:
      "Learn English online with Fortuna Center's LMS — interactive lessons, certified teachers, and detailed progress tracking.",
    url: "https://www.fortunacenter.com/programs/lms",
  },
};

export default function LMSProgramLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
