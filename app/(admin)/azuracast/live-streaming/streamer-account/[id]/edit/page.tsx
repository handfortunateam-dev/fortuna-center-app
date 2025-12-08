import React from "react";
import StreamerForm from "../../StreamerForm";
import { PageHeader } from "@/components/ui/Common/PageHeader";
import { getStreamer } from "@/services/azurecast/azuracastPrivateService";

interface EditStreamerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStreamerPage({
  params,
}: EditStreamerPageProps) {
  const { id } = await params;
  const streamer = await getStreamer(parseInt(id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Streamer"
        description={`Edit streamer account: ${streamer.display_name}`}
        breadcrumbs={[
          {
            label: "Streamer Accounts",
            href: "/azuracast/live-streaming/streamer-account",
          },
          { label: "Edit Streamer" },
        ]}
      />
      <StreamerForm initialData={streamer} isEditing />
    </div>
  );
}
