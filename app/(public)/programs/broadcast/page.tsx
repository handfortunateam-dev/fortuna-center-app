import type { Metadata } from "next";
import BroadcastProgramClient from "./BroadcastProgramClient";

export const metadata: Metadata = {
  title: "Broadcast Training Program",
  description:
    "Master the art of live broadcasting, audio engineering, and digital media production in our state-of-the-art studio at Fortuna Center Kupang.",
  alternates: {
    canonical: "https://www.fortunacenter.com/programs/broadcast",
  },
};

export default function Page() {
  return <BroadcastProgramClient />;
}
