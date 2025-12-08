import React from "react";
import StreamerForm from "../StreamerForm";
import { PageHeader } from "@/components/ui/Common/PageHeader";

export default function CreateStreamerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Streamer"
        description="Create a new streamer account."
        breadcrumbs={[
          {
            label: "Streamer Accounts",
            href: "/azuracast/live-streaming/streamer-account",
          },
          { label: "Add Streamer" },
        ]}
      />
      <StreamerForm />
    </div>
  );
}
