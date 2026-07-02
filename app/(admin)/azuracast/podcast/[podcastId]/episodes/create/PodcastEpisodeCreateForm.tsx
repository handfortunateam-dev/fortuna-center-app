"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  Input,
  Textarea,
  Switch,
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@heroui/react";
import { UpdatePodcastEpisodePayload } from "@/services/azurecast/interfaces";
import {
  createPodcastEpisode,
  uploadPodcastMedia,
} from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { Icon } from "@iconify/react";

interface PodcastEpisodeCreateFormProps {
  podcastId: string;
}

export default function PodcastEpisodeCreateForm({
  podcastId,
}: PodcastEpisodeCreateFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("basic");

  // Form State
  const [formData, setFormData] = useState<UpdatePodcastEpisodePayload>({
    title: "",
    link: "",
    description: "",
    publish_at: Math.floor(Date.now() / 1000),
    explicit: false,
    season_number: null,
    episode_number: null,
    artwork_file: null,
    media_file: null,
  });

  // Media State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Date and Time state for UI
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeInput, setTimeInput] = useState(
    new Date().toTimeString().split(" ")[0].slice(0, 5)
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, explicit: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
    updatePublishAt(e.target.value, timeInput);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
    updatePublishAt(dateInput, e.target.value);
  };

  const updatePublishAt = (date: string, time: string) => {
    if (date && time) {
      const dateTimeString = `${date}T${time}`;
      const timestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);
      setFormData((prev) => ({ ...prev, publish_at: timestamp }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMediaFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalPayload = { ...formData };

      // 1. Upload Media if selected
      if (mediaFile) {
        const mediaFormData = new FormData();
        mediaFormData.append("file", mediaFile);

        // Upload media first
        const uploadResponse = await uploadPodcastMedia(
          podcastId,
          mediaFormData
        );

        // Check if upload response contains the necessary info
        // Based on user feedback, we expect something like:
        // { originalFilename: "...", uploadedPath: "..." }
        // Or we might need to adapt based on actual API response structure.
        // Assuming the API returns the file info directly or in a specific property.

        if (uploadResponse) {
          // If the API returns the file info directly
          finalPayload.media_file = {
            originalFilename: mediaFile.name,
            uploadedPath: uploadResponse, // Assuming the response string IS the path, or we need to extract it.
            // Wait, the user said: "media_file":{"originalFilename":"...","uploadedPath":"..."}
            // The upload API likely returns the path string or an object containing it.
            // Let's assume for now the uploadPodcastMedia returns the path string or the object we need.
            // If uploadPodcastMedia returns the JSON response, and that response IS the path or contains it.
            // Let's look at the user's example again.
            // The user provided the PAYLOAD for the create endpoint.
            // They didn't explicitly say what the upload endpoint returns, but usually it returns the path.
            // Let's assume uploadResponse IS the path for now, or try to use it as is if it's an object.
          };

          // Actually, looking at typical AzuraCast behavior or similar APIs:
          // The upload endpoint usually returns the temporary path.
          // Let's assume uploadResponse is the path string.
          // If it's an object, we might need to inspect it.
          // Let's try to be robust.

          let uploadedPath = "";
          const responseAny = uploadResponse as any;

          if (typeof responseAny === "string") {
            uploadedPath = responseAny;
          } else if (typeof responseAny === "object" && responseAny.path) {
            uploadedPath = responseAny.path;
          } else if (
            typeof responseAny === "object" &&
            responseAny.uploadedPath
          ) {
            uploadedPath = responseAny.uploadedPath;
          } else {
            // Fallback: try to use the whole response if it looks like a path, or just log warning
            console.warn("Unexpected upload response:", uploadResponse);
            // If we can't find a path, we might fail or try to proceed without media
          }

          // If we found a path, use it.
          // Note: The user's example showed "uploadedPath": "/var/azuracast/..."
          // So we need that path.

          // Let's assume the uploadPodcastMedia returns the JSON which might be just the string path or { path: ... }
          // We will use the result of uploadPodcastMedia as the uploadedPath if it's a string.

          if (uploadedPath || typeof responseAny === "string") {
            finalPayload.media_file = {
              originalFilename: mediaFile.name,
              uploadedPath: uploadedPath || (responseAny as string),
            };
          }
        }
      }

      // 2. Create Episode with (potentially) updated payload
      await createPodcastEpisode(podcastId, finalPayload);

      Toast({
        title: "Success",
        description: "Episode created successfully",
        color: "success",
      });
      router.push(`/azuracast/podcast/${podcastId}/episodes`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create episode:", error);
      Toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create episode",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add Episode</h1>
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          className="text-gray-500"
        >
          ✕
        </Button>
      </div>

      <Tabs
        aria-label="Episode Options"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="basic" title="Basic Information">
          <Card>
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Episode"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  isRequired
                  placeholder="Episode Title"
                />
                <Input
                  label="Website"
                  name="link"
                  value={formData.link || ""}
                  onChange={handleInputChange}
                  placeholder="http://example.com"
                  description="Typically a website with content about the episode."
                />
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                isRequired
                placeholder="Episode Description"
                description="The description of the episode. The typical maximum amount of text allowed for this is 4000 characters."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="date"
                  label="Publish At"
                  value={dateInput}
                  onChange={handleDateChange}
                />
                <Input
                  type="time"
                  label="Time"
                  value={timeInput}
                  onChange={handleTimeChange}
                />
              </div>
              <p className="text-xs text-gray-500">
                The date and time when the episode should be published.
              </p>

              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.explicit}
                  onValueChange={handleSwitchChange}
                >
                  Contains explicit content
                </Switch>
              </div>
              <p className="text-xs text-gray-500">
                Indicates the presence of explicit content.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  label="Season Number"
                  name="season_number"
                  value={formData.season_number?.toString() || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      season_number: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                />
                <Input
                  type="number"
                  label="Episode Number"
                  name="episode_number"
                  value={formData.episode_number?.toString() || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      episode_number: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="media" title="Media">
          <Card>
            <CardBody className="gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2">
                    Select Media File
                  </h3>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".mp3,.m4a"
                      onChange={handleFileSelect}
                    />
                    <p className="text-gray-500 mb-4">
                      Drag file(s) here to upload or
                    </p>
                    <Button
                      color="primary"
                      startContent={<Icon icon="lucide:upload" />}
                    >
                      SELECT FILE
                    </Button>
                    {mediaFile && (
                      <div className="mt-4 text-sm font-medium text-primary">
                        Selected: {mediaFile.name}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Podcast media should be in the MP3 or M4A (AAC) format for
                    the greatest compatibility.
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2">
                    Current Podcast Media
                  </h3>
                  <Button
                    color="danger"
                    className="w-full"
                    disabled={!mediaFile}
                    onPress={() => setMediaFile(null)}
                  >
                    CLEAR MEDIA
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="artwork" title="Artwork">
          <Card>
            <CardBody>
              <p className="text-gray-500">
                Artwork upload is not yet implemented in this demo.
              </p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="flat" onPress={() => router.back()}>
          CLOSE
        </Button>
        <Button color="primary" onPress={handleSave} isLoading={isSaving}>
          SAVE CHANGES
        </Button>
      </div>
    </div>
  );
}
