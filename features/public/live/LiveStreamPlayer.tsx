"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface LiveStreamPlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  channelId?: string;
}

export default function LiveStreamPlayer({
  videoId,
  title,
  description,
  publishedAt,
}: LiveStreamPlayerProps) {
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.hostname);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Main Video Section */}
      <div className="lg:col-span-2 flex flex-col h-full gap-4">
        <Card className="flex-grow w-full bg-black border-none">
          <CardBody className="p-0 overflow-hidden relative">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              title="YouTube Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </CardBody>
        </Card>

        {(title || description) && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="space-y-2">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                )}
                {publishedAt && (
                  <p className="text-sm text-gray-500">
                    Started streaming on{" "}
                    {new Date(publishedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                as={Link}
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                color="danger"
                variant="flat"
                startContent={<Icon icon="logos:youtube-icon" />}
                className="shrink-0"
              >
                Watch on YouTube
              </Button>
            </div>

            {description && (
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Live Chat Section */}
      <div className="lg:col-span-1 h-full">
        <Card className="h-full w-full bg-white dark:bg-zinc-900 border-none">
          <CardBody className="p-0 h-full">
            {domain ? (
              <iframe
                src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${domain}`}
                className="w-full h-full min-h-[500px]"
                title="Live Chat"
                frameBorder="0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading Chat...
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
