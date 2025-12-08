"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";

export default function WebDJPage() {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Construct the WebDJ URL using the environment variable or fallback
    // The user specifically asked for: http://localhost/public/fortuna-center/dj
    // but in production/dev it should probably be dynamic based on AZURACAST_BASE_URL.
    // However, for the user's specific request "http://localhost/public/fortuna-center/dj",
    // we will prioritize constructing it from the env if available to be more robust.

    // Assuming the station name "fortuna-center" might be dynamic or fixed.
    // Given the user request is specific, we'll try to use the env var + station name logic usually found.
    // If NEXT_PUBLIC_AZURACAST_BASE_URL is "http://localhost", we append "/public/fortuna-center/dj"

    const baseUrl =
      process.env.NEXT_PUBLIC_AZURACAST_BASE_URL || "http://localhost";
    // We might need to know the station shortcode. Often it's in env or we can hardcode for this specific request if needed.
    // Let's assume 'fortuna-center' is the station shortcode based on the user's url.

    // Clean trailing slash from base url
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const targetUrl = `${cleanBaseUrl}/public/fortuna-center/dj`;

    setIframeUrl(targetUrl);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Web DJ</h1>
          <p className="text-gray-500">
            Broadcast live directly from your browser using the AzuraCast Web DJ
            tool.
          </p>
        </div>
      </div>

      <Card className="min-h-[800px] w-full bg-black/5 dark:bg-white/5 border-none shadow-none">
        <CardBody className="p-0 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50 dark:bg-gray-900">
              <Spinner size="lg" label="Loading Web DJ..." color="primary" />
            </div>
          )}
          {iframeUrl && (
            <iframe
              src={iframeUrl}
              className="w-full h-[800px] border-none"
              allow="microphone; camera; autoplay"
              onLoad={() => setIsLoading(false)}
              title="AzuraCast Web DJ"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
