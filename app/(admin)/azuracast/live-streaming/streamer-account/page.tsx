import React from "react";
import {
  getStreamers,
  getVueStreamers,
} from "@/services/azurecast/azuracastPrivateService";
import StreamerAccountClient from "./StreamerAccountClient";

export const dynamic = "force-dynamic";

export default async function StreamerAccountPage() {
  try {
    const [streamers, connectionInfo] = await Promise.all([
      getStreamers(),
      getVueStreamers(),
    ]);

    return (
      <div className="p-6">
        <StreamerAccountClient
          initialStreamers={streamers}
          connectionInfo={connectionInfo}
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to load streamer account data:", error);
    return (
      <div className="p-6 text-red-500">
        Failed to load streamer account data. Please try again later.
      </div>
    );
  }
}
