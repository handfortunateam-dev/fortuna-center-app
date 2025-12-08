"use client";

import React, { useState } from "react";
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
import {
  PodcastEpisode,
  UpdatePodcastEpisodePayload,
} from "@/services/azurecast/interfaces";
import {
  updatePodcastEpisode,
  uploadPodcastMedia,
  deletePodcastEpisodeMedia,
} from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Toast";
import Image from "next/image";
import { ConfirmDialog } from "@/components/ui/Common/ConfirmDialog";

interface PodcastEpisodeEditFormProps {
  podcastId: string;
  episode: PodcastEpisode;
}

export default function PodcastEpisodeEditForm({
  podcastId,
  episode,
}: PodcastEpisodeEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdatePodcastEpisodePayload>({
    title: episode.title,
    link: episode.link,
    description: episode.description,
    publish_at: episode.publish_at,
    explicit: episode.explicit,
    season_number: episode.season_number,
    episode_number: episode.episode_number,
    artwork_file: null,
    media_file: null,
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Date and Time state for UI
  const publishDate = episode.publish_at
    ? new Date(episode.publish_at * 1000).toISOString().split("T")[0]
    : "";
  const publishTime = episode.publish_at
    ? new Date(episode.publish_at * 1000).toTimeString().split(" ")[0]
    : "";

  const [dateInput, setDateInput] = useState(publishDate);
  const [timeInput, setTimeInput] = useState(publishTime);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePodcastEpisode(podcastId, episode.id, formData);
      Toast({
        title: "Success",
        description: "Episode updated successfully",
        color: "success",
      });
      router.refresh();
      router.back();
    } catch (error) {
      console.error("Failed to update episode:", error);
      Toast({
        title: "Error",
        description: "Failed to update episode",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpload = async () => {
    if (!mediaFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      await uploadPodcastMedia(podcastId, formData);
      Toast({
        title: "Success",
        description: "Media uploaded successfully",
        color: "success",
      });
      setMediaFile(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to upload media:", error);
      Toast({
        title: "Error",
        description: "Failed to upload media",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaDelete = () => {
    setIsConfirmDialogOpen(true);
  };

  const executeMediaDelete = async () => {
    setIsDeletingMedia(true);
    try {
      await deletePodcastEpisodeMedia(podcastId, episode.id);
      Toast({
        title: "Success",
        description: "Media deleted successfully",
        color: "success",
      });
      router.refresh();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete media:", error);
      Toast({
        title: "Error",
        description: "Failed to delete media",
        color: "danger",
      });
    } finally {
      setIsDeletingMedia(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={executeMediaDelete}
        title="Delete Media"
        message="Are you sure you want to delete the media for this episode? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeletingMedia}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit Episode</h1>
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          className="text-gray-500"
        >
          ✕
        </Button>
      </div>

      <Tabs aria-label="Episode Options">
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
                  label="Publish Date"
                  value={dateInput}
                  onChange={handleDateChange}
                />
                <Input
                  type="time"
                  label="Publish Time"
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
                Indicates the presence of explicit content (explicit language or
                adult content). Apple Podcasts displays an Explicit parental
                advisory graphic for your episode if turned on. Episodes
                containing explicit material aren&apos;t available in some Apple
                Podcasts territories.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex gap-2">
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
                    className="flex-1"
                  />
                  <Button
                    variant="flat"
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, season_number: null }))
                    }
                  >
                    CLEAR
                  </Button>
                </div>
                <div className="flex gap-2">
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
                    className="flex-1"
                  />
                  <Button
                    variant="flat"
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, episode_number: null }))
                    }
                  >
                    CLEAR
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <p className="text-xs text-gray-500">
                  Optionally list this episode as part of a season in some
                  podcast aggregators.
                </p>
                <p className="text-xs text-gray-500">
                  Optionally set a specific episode number in some podcast
                  aggregators.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="media" title="Media">
          <Card>
            <CardBody className="gap-4">
              <div className="flex flex-col gap-4">
                {episode.media ? (
                  <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                          Media Available
                        </h3>
                        <p className="text-sm">
                          This episode has an associated media file.
                        </p>
                      </div>
                      <Button
                        color="danger"
                        variant="flat"
                        isLoading={isDeletingMedia}
                        onPress={handleMediaDelete}
                      >
                        DELETE MEDIA
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      No Media
                    </h3>
                    <p className="text-sm">
                      This episode does not have any media uploaded yet.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Upload New Media
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMediaFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Button
                      color="primary"
                      isDisabled={!mediaFile}
                      isLoading={isUploading}
                      onPress={handleMediaUpload}
                    >
                      UPLOAD
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Select an audio file to upload for this episode. Existing
                    media will be replaced.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="artwork" title="Artwork">
          <Card>
            <CardBody className="gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Input
                    type="file"
                    label="Select PNG/JPG artwork file"
                    accept="image/png, image/jpeg"
                    // File input handling would be more complex, placeholder for now
                    disabled
                    placeholder="No file chosen"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Artwork must be a minimum size of 1400 x 1400 pixels and a
                    maximum size of 3000 x 3000 pixels for Apple Podcasts.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-48 w-48 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <Image
                      src={episode.art || "/placeholder.png"}
                      alt="Episode Artwork"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button color="danger" variant="flat" className="w-full">
                    CLEAR ARTWORK
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="flat" onPress={() => router.back()}>
          CLOSE
        </Button>
        <Button color="danger" isLoading={isSaving} onPress={handleSave}>
          SAVE CHANGES
        </Button>
      </div>
    </div>
  );
}
