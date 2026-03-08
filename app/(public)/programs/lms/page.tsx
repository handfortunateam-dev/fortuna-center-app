import type { Metadata } from "next";
import LMSProgramClient from "./LMSProgramClient";

export const metadata: Metadata = {
  title: "LMS for English Mastery",
  description:
    "Accelerate your English proficiency through our interactive Learning Management System at Fortuna Center Kupang.",
  alternates: {
    canonical: "https://www.fortunacenter.com/programs/lms",
  },
};

export default function Page() {
  return <LMSProgramClient />;
}
