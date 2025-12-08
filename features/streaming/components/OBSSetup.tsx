"use client";

import React, { useState } from 'react';
import { Button, Card, CardBody, Input, Snippet } from "@heroui/react";
import { Icon } from "@iconify/react";

interface OBSSetupProps {
  rtmpUrl: string;
  streamKey: string;
}

export default function OBSSetup({ rtmpUrl, streamKey }: OBSSetupProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="simple-icons:obs" className="text-4xl text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-default-900">Connect via OBS</h2>
        <p className="text-default-500">
          Enter the following details into your streaming software (OBS, vMix, etc.)
        </p>
      </div>

      <Card className="border border-default-200 shadow-sm">
        <CardBody className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700">Server URL</label>
            <Snippet symbol="" className="w-full bg-default-100" codeString={rtmpUrl}>
              {rtmpUrl}
            </Snippet>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-default-700">Stream Key</label>
            <div className="flex gap-2">
              <Input 
                type={isVisible ? "text" : "password"}
                value={streamKey}
                isReadOnly
                endContent={
                  <button onClick={() => setIsVisible(!isVisible)} className="focus:outline-none">
                    <Icon icon={isVisible ? "solar:eye-bold" : "solar:eye-closed-bold"} className="text-default-400" />
                  </button>
                }
                className="flex-1"
              />
              <Button 
                isIconOnly 
                variant="flat" 
                onClick={() => navigator.clipboard.writeText(streamKey)}
              >
                <Icon icon="solar:copy-bold" />
              </Button>
            </div>
            <p className="text-xs text-danger">
              Keep this key secret! Anyone with this key can stream to your channel.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Icon icon="solar:info-circle-bold" className="text-blue-500 text-xl shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Recommended OBS Settings:</p>
          <ul className="list-disc list-inside space-y-1 opacity-90">
            <li>Video Bitrate: 4500 Kbps</li>
            <li>Keyframe Interval: 2 seconds</li>
            <li>Profile: High / Main</li>
            <li>Audio Bitrate: 128 Kbps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
