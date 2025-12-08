"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";

interface BroadcasterProps {
  sessionId: string;
  token?: string;
  wsUrl?: string;
  onStop?: () => void;
}

export default function Broadcaster({ sessionId, token, wsUrl, onStop }: BroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [selectedAudio, setSelectedAudio] = useState<string>("");

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
  }, []);

  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedVideo },
        audio: selectedAudio ? { deviceId: selectedAudio } : true
      }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(console.error);
    }
  }, [selectedVideo, selectedAudio]);

  const toggleLive = () => {
    if (isLive) {
      // Stop logic
      setIsLive(false);
      if (onStop) onStop();
    } else {
      // Start logic (Connect to LiveKit)
      console.log("Connecting to LiveKit with", wsUrl, token);
      setIsLive(true);
    }
  };

  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioInputs = devices.filter(d => d.kind === 'audioinput');

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-default-200">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-4 right-4 flex gap-2">
          {isLive && (
            <div className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-4 items-center justify-center">
             <Button 
               color={isLive ? "danger" : "success"} 
               size="lg"
               onPress={toggleLive}
               startContent={<Icon icon={isLive ? "solar:stop-circle-bold" : "solar:play-circle-bold"} />}
             >
               {isLive ? "End Stream" : "Go Live"}
             </Button>
          </div>
        </div>
      </div>

      <Card className="bg-default-50 border border-default-200">
        <CardBody className="flex flex-row gap-4">
          <Select 
            label="Camera" 
            placeholder="Select Camera"
            selectedKeys={selectedVideo ? [selectedVideo] : []}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="flex-1"
          >
            {videoInputs.map(d => (
              <SelectItem key={d.deviceId} textValue={d.label || "Unknown Camera"}>
                {d.label || "Unknown Camera"}
              </SelectItem>
            ))}
          </Select>
          <Select 
            label="Microphone" 
            placeholder="Select Mic"
            selectedKeys={selectedAudio ? [selectedAudio] : []}
            onChange={(e) => setSelectedAudio(e.target.value)}
            className="flex-1"
          >
            {audioInputs.map(d => (
              <SelectItem key={d.deviceId} textValue={d.label || "Unknown Mic"}>
                {d.label || "Unknown Mic"}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>
    </div>
  );
}
