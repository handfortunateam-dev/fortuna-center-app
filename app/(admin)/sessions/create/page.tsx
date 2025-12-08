"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Broadcaster from "@/features/streaming/components/Broadcaster";
import OBSSetup from "@/features/streaming/components/OBSSetup";
import AudioBroadcaster from "@/features/streaming/components/AudioBroadcaster";

interface DeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
}

export default function CreateSessionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "browser",
    scheduledTime: "",
    isPublic: true,
  });

  const [createdSession, setCreatedSession] = useState<any>(null);

  useEffect(() => {
    // Only request permissions for browser mode
    if (typeof window !== "undefined" && navigator.mediaDevices && formData.platform === 'browser') {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(() => {
          setPermissionGranted(true);
          enumerateDevices();
        })
        .catch((err) => {
          console.error("Permission denied or error:", err);
          enumerateDevices();
        });
    }
  }, [formData.platform]);

  const enumerateDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        deviceList.map((d) => ({
          deviceId: d.deviceId,
          kind: d.kind,
          label: d.label || `Unknown ${d.kind}`,
        }))
      );
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  };

  const audioInputs = devices.filter((d) => d.kind === "audioinput");
  const videoInputs = devices.filter((d) => d.kind === "videoinput");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/live/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inputType: formData.platform
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCreatedSession(data);
      } else {
        alert("Failed to create session");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating session");
    } finally {
      setIsLoading(false);
    }
  };

  if (createdSession) {
    if (createdSession.session.inputType === 'browser') {
      return (
        <div className="h-[calc(100vh-100px)] p-6">
          <Broadcaster 
            sessionId={createdSession.session.id}
            token={createdSession.connectionDetails?.token}
            wsUrl={createdSession.connectionDetails?.wsUrl}
            onStop={() => setCreatedSession(null)}
          />
        </div>
      );
    } else if (createdSession.session.inputType === 'audio') {
      return (
        <div className="h-[calc(100vh-100px)] p-6">
          <AudioBroadcaster 
            sessionId={createdSession.session.id}
            token={createdSession.connectionDetails?.token}
            wsUrl={createdSession.connectionDetails?.wsUrl}
            onStop={() => setCreatedSession(null)}
          />
        </div>
      );
    } else {
      return (
        <div className="p-6">
          <OBSSetup 
            rtmpUrl={createdSession.session.rtmpUrl}
            streamKey={createdSession.session.streamKey}
          />
          <div className="mt-8 flex justify-center">
            <Button variant="flat" onPress={() => setCreatedSession(null)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Create Broadcast Session
        </h1>
        <p className="text-default-500">
          Configure your new streaming session and setup hardware.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Session Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-default-200 shadow-xl">
            <CardHeader className="flex gap-3 px-6 pt-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon icon="solar:videocamera-record-bold-duotone" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">Session Details</p>
                <p className="text-small text-default-500">
                  Basic information about the broadcast.
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-6 px-6 py-6">
              <Input
                label="Session Title"
                placeholder="e.g., Sunday Morning Service"
                variant="bordered"
                value={formData.title}
                onValueChange={(val) => setFormData({ ...formData, title: val })}
                isRequired
                startContent={
                  <Icon icon="solar:pen-bold" className="text-default-400" />
                }
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Platform"
                  placeholder="Select Platform"
                  variant="bordered"
                  selectedKeys={[formData.platform]}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  startContent={
                    <Icon icon="solar:monitor-smartphone-bold" className="text-default-400" />
                  }
                >
                  <SelectItem key="browser" startContent={<Icon icon="solar:videocamera-record-bold" />}>
                    Browser Stream (WebRTC)
                  </SelectItem>
                  <SelectItem key="audio" startContent={<Icon icon="solar:radio-minimalistic-bold" />}>
                    Audio / Radio Stream
                  </SelectItem>
                  <SelectItem key="rtmp" startContent={<Icon icon="simple-icons:obs" />}>
                    OBS / RTMP Ingest
                  </SelectItem>
                </Select>

                <Input
                  type="datetime-local"
                  label="Schedule Time"
                  variant="bordered"
                  value={formData.scheduledTime}
                  onValueChange={(val) => setFormData({ ...formData, scheduledTime: val })}
                  isRequired
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Enter a description for the broadcast..."
                variant="bordered"
                minRows={3}
                value={formData.description}
                onValueChange={(val) => setFormData({ ...formData, description: val })}
              />

              <div className="flex items-center justify-between p-4 rounded-xl bg-default-50 border border-default-100">
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-full bg-success/10 text-success">
                    <Icon icon="solar:globe-bold" width={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Public Session</span>
                    <span className="text-xs text-default-400">Visible to everyone</span>
                  </div>
                </div>
                <Switch 
                  isSelected={formData.isPublic} 
                  onValueChange={(val) => setFormData({ ...formData, isPublic: val })}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Hardware & Status */}
        <div className="space-y-6">
          {/* Only show hardware setup for browser mode */}
          {formData.platform === 'browser' && (
            <Card className="bg-white border border-default-200 shadow-xl">
              <CardHeader className="flex gap-3 px-6 pt-6">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Icon icon="solar:devices-bold-duotone" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-semibold">Hardware Setup</p>
                  <p className="text-small text-default-500">
                    Select camera and microphone.
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-6 px-6 py-6">
                {!permissionGranted && (
                  <div className="p-3 rounded-lg bg-warning/10 text-warning text-sm flex gap-2 items-start">
                    <Icon icon="solar:shield-warning-bold" className="mt-0.5 shrink-0" />
                    <p>Please allow camera/microphone access to detect devices.</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-default-700 mb-2 block">
                      Video Input (Camera)
                    </label>
                    <Select
                      placeholder="Select Camera"
                      variant="bordered"
                      selectedKeys={selectedVideo ? [selectedVideo] : []}
                      onChange={(e) => setSelectedVideo(e.target.value)}
                      startContent={<Icon icon="solar:camera-bold" className="text-default-400" />}
                      isDisabled={videoInputs.length === 0}
                    >
                      {videoInputs.map((device) => (
                        <SelectItem key={device.deviceId} textValue={device.label}>
                          <div className="flex flex-col">
                            <span>{device.label}</span>
                            <span className="text-tiny text-default-400 truncate">{device.deviceId}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    {videoInputs.length === 0 && permissionGranted && (
                      <p className="text-tiny text-danger mt-1">No cameras detected.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-default-700 mb-2 block">
                      Audio Input (Mic)
                    </label>
                    <Select
                      placeholder="Select Microphone"
                      variant="bordered"
                      selectedKeys={selectedAudio ? [selectedAudio] : []}
                      onChange={(e) => setSelectedAudio(e.target.value)}
                      startContent={<Icon icon="solar:microphone-3-bold" className="text-default-400" />}
                      isDisabled={audioInputs.length === 0}
                    >
                      {audioInputs.map((device) => (
                        <SelectItem key={device.deviceId} textValue={device.label}>
                          <div className="flex flex-col">
                            <span>{device.label}</span>
                            <span className="text-tiny text-default-400 truncate">{device.deviceId}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    {audioInputs.length === 0 && permissionGranted && (
                      <p className="text-tiny text-danger mt-1">No microphones detected.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-default-50 border border-default-100">
                  <h4 className="text-xs font-semibold text-default-500 uppercase mb-3">Detected Hardware Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">Cameras</span>
                      <Chip size="sm" variant="flat" color={videoInputs.length > 0 ? "success" : "default"}>
                        {videoInputs.length} Available
                      </Chip>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">Microphones</span>
                      <Chip size="sm" variant="flat" color={audioInputs.length > 0 ? "success" : "default"}>
                        {audioInputs.length} Available
                      </Chip>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Info card for audio/rtmp modes */}
          {formData.platform !== 'browser' && (
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
              <CardBody className="p-6 text-center">
                <Icon 
                  icon={formData.platform === 'audio' ? "solar:radio-minimalistic-bold-duotone" : "simple-icons:obs"} 
                  className="text-6xl text-cyan-500 mx-auto mb-4" 
                />
                <h3 className="text-lg font-bold text-default-900 mb-2">
                  {formData.platform === 'audio' ? 'Audio-Only Broadcasting' : 'External Software Streaming'}
                </h3>
                <p className="text-sm text-default-600">
                  {formData.platform === 'audio' 
                    ? 'You will select your microphone on the next screen'
                    : 'You will receive RTMP credentials on the next screen'}
                </p>
              </CardBody>
            </Card>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold shadow-lg shadow-primary/20"
            isLoading={isLoading}
            startContent={!isLoading && <Icon icon="solar:play-circle-bold" width={24} />}
          >
            Create Session
          </Button>
        </div>
      </form>
    </div>
  );
}
