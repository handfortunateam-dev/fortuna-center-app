"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, CardBody, Select, SelectItem, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface AudioBroadcasterProps {
  sessionId: string;
  token?: string;
  wsUrl?: string;
  onStop?: () => void;
}

export default function AudioBroadcaster({ sessionId, token, wsUrl, onStop }: AudioBroadcasterProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isLive, setIsLive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(deviceList => {
      setDevices(deviceList.filter(d => d.kind === 'audioinput'));
    });
  }, []);

  useEffect(() => {
    if (isLive && selectedAudio) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
    }
    return () => stopAudioVisualization();
  }, [isLive, selectedAudio]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedAudio ? { deviceId: selectedAudio } : true
      });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      visualize();
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      // Calculate average audio level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(Math.round((average / 255) * 100));

      // Clear canvas
      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(1, '#3b82f6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const toggleLive = () => {
    if (isLive) {
      setIsLive(false);
      if (onStop) onStop();
    } else {
      console.log("Starting audio broadcast to LiveKit", wsUrl, token);
      setIsLive(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:radio-minimalistic-bold" className="text-5xl text-white" />
        </div>
        <h2 className="text-3xl font-bold text-default-900">Audio / Radio Broadcast</h2>
        <p className="text-default-500">Stream audio-only content to your listeners</p>
      </div>

      <Card className="bg-default-50 border border-default-200">
        <CardBody className="p-8">
          {/* Audio Visualizer */}
          <div className="relative mb-6">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={200}
              className="w-full rounded-xl bg-slate-900 shadow-lg"
            />
            
            {isLive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                ON AIR
              </div>
            )}

            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl backdrop-blur-sm">
                <div className="text-center text-white/70">
                  <Icon icon="solar:microphone-3-bold-duotone" className="text-6xl mb-2 mx-auto opacity-50" />
                  <p>Select microphone and go live to see audio levels</p>
                </div>
              </div>
            )}
          </div>

          {/* Audio Level Meter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-default-700">Audio Level</span>
              <span className="text-sm font-bold text-primary">{audioLevel}%</span>
            </div>
            <div className="w-full h-3 bg-default-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>

          {/* Microphone Selection */}
          <Select 
            label="Microphone / Audio Input" 
            placeholder="Select Audio Source"
            selectedKeys={selectedAudio ? [selectedAudio] : []}
            onChange={(e) => setSelectedAudio(e.target.value)}
            startContent={<Icon icon="solar:microphone-3-bold" className="text-default-400" />}
            className="mb-6"
            isDisabled={isLive}
          >
            {devices.map(d => (
              <SelectItem key={d.deviceId} textValue={d.label || "Unknown Microphone"}>
                {d.label || "Unknown Microphone"}
              </SelectItem>
            ))}
          </Select>

          {/* Controls */}
          <div className="flex gap-4 items-center justify-center">
            <Button 
              color={isLive ? "danger" : "success"} 
              size="lg"
              onPress={toggleLive}
              startContent={<Icon icon={isLive ? "solar:stop-circle-bold" : "solar:play-circle-bold"} width={24} />}
              className="font-semibold px-8"
              isDisabled={!selectedAudio}
            >
              {isLive ? "End Broadcast" : "Go Live"}
            </Button>
          </div>

          {!selectedAudio && (
            <p className="text-center text-sm text-warning mt-4">
              Please select a microphone to start broadcasting
            </p>
          )}
        </CardBody>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border border-blue-100">
          <CardBody className="p-4 text-center">
            <Icon icon="solar:users-group-rounded-bold" className="text-3xl text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-700 font-medium">Listeners</p>
            <p className="text-2xl font-bold text-blue-900">0</p>
          </CardBody>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <CardBody className="p-4 text-center">
            <Icon icon="solar:clock-circle-bold" className="text-3xl text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">Duration</p>
            <p className="text-2xl font-bold text-green-900">00:00</p>
          </CardBody>
        </Card>

        <Card className="bg-purple-50 border border-purple-100">
          <CardBody className="p-4 text-center">
            <Icon icon="solar:soundwave-bold" className="text-3xl text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-purple-700 font-medium">Bitrate</p>
            <p className="text-2xl font-bold text-purple-900">128k</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
