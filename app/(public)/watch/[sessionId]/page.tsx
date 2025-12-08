"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StreamPlayer from '@/features/streaming/components/StreamPlayer';
import { Card, CardBody, Chip, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function WatchPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [viewerData, setViewerData] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/live/view/${sessionId}`);
        const data = await res.json();
        setViewerData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load session:', error);
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!viewerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <Icon icon="solar:videocamera-off-bold-duotone" className="text-6xl text-default-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-default-900 mb-2">Stream Not Found</h2>
            <p className="text-default-500">This stream may have ended or doesn't exist.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <StreamPlayer 
              token={viewerData.token}
              wsUrl={viewerData.wsUrl}
              hlsUrl={viewerData.hlsUrl}
              isLive={true}
            />
            
            <div className="bg-default-50 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-default-900 mb-2">
                    Live Stream Title
                  </h1>
                  <p className="text-default-500">
                    Stream description goes here...
                  </p>
                </div>
                <Chip 
                  color="danger" 
                  variant="flat"
                  startContent={<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                >
                  LIVE
                </Chip>
              </div>
            </div>
          </div>

          {/* Chat/Info Sidebar */}
          <div className="space-y-4">
            <Card className="bg-default-50 border border-default-200">
              <CardBody className="p-6">
                <h3 className="font-bold text-default-900 mb-4 flex items-center gap-2">
                  <Icon icon="solar:chat-round-dots-bold" />
                  Live Chat
                </h3>
                <div className="h-96 flex items-center justify-center text-default-400">
                  <p className="text-sm">Chat feature coming soon...</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-50 border border-default-200">
              <CardBody className="p-6">
                <h3 className="font-bold text-default-900 mb-4 flex items-center gap-2">
                  <Icon icon="solar:users-group-rounded-bold" />
                  Viewers
                </h3>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:eye-bold" className="text-primary" />
                  <span className="text-2xl font-bold text-default-900">1,234</span>
                  <span className="text-default-500 text-sm">watching now</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
