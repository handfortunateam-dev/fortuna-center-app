"use client";

import React from 'react';
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

interface StreamPlayerProps {
  token?: string;
  wsUrl?: string;
  hlsUrl?: string;
  isLive?: boolean;
}

export default function StreamPlayer({ token, wsUrl, hlsUrl, isLive = false }: StreamPlayerProps) {
  // In a real implementation, this would use LiveKit's VideoRenderer or a HLS player like hls.js
  
  if (!isLive) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white/50 flex-col gap-4">
        <Icon icon="solar:videocamera-record-bold-duotone" className="text-6xl opacity-50" />
        <p>Stream is offline</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
      {/* Mock Video Player */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <Icon icon="solar:play-circle-bold" className="text-6xl text-white opacity-80" />
      </div>
      
      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button><Icon icon="solar:play-bold" className="text-2xl" /></button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm font-bold">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button><Icon icon="solar:settings-bold" className="text-xl" /></button>
             <button><Icon icon="solar:full-screen-bold" className="text-xl" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
