"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { CreatePodcastEpisodeData, PodcastEpisodeDetail } from "./interfaces";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs/TextInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput";
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { Heading } from "@/components/heading";
import FileUpload from "@/components/inputs/FileUpload";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PodcastEpisodeFormProps {
  initialData?: PodcastEpisodeDetail;
  onSubmit: (data: CreatePodcastEpisodeData) => Promise<void>;
  isLoading?: boolean;
}

export default function PodcastEpisodeForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PodcastEpisodeFormProps) {
  const router = useRouter();
  const methods = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      audioUrl: initialData?.audioUrl || "",
      thumbnailUrl: initialData?.thumbnailUrl || "",
      seasonNumber: initialData?.seasonNumber || 1,
      episodeNumber: initialData?.episodeNumber || 1,
      status: initialData?.status || "draft",
      duration: initialData?.duration || 0,
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : "",
    },
  });
  const { handleSubmit, setValue, control } = methods;

  const audioUrl = useWatch({ control, name: "audioUrl" });
  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" });
  const [detectingDuration, setDetectingDuration] = useState(false);

  // Auto-detect duration when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioUrl !== initialData?.audioUrl) {
      setDetectingDuration(true);
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        setValue("duration", Math.round(audio.duration));
        setDetectingDuration(false);
      };
      audio.onerror = () => {
        setDetectingDuration(false);
      };
    }
  }, [audioUrl, setValue, initialData]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-default-200 space-y-4">
              <Heading
                className="text-xl font-bold flex items-center gap-2"
                startContent={
                  <Icon icon="lucide:mic" className="text-primary" />
                }
              >
                Episode Details
              </Heading>

              <TextInput
                name="title"
                label="Episode Title"
                placeholder="Enter episode title"
                validation={{ required: "Title is required" }}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  name="seasonNumber"
                  label="Season #"
                  type="number"
                  placeholder="1"
                />
                <TextInput
                  name="episodeNumber"
                  label="Episode #"
                  type="number"
                  placeholder="1"
                />
              </div>

              <TextareaInput
                name="description"
                label="Show Notes / Description"
                placeholder="Enter episode description or show notes"
                required={false}
                minRows={4}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Audio File</label>
                {audioUrl && (
                  <div className="p-4 bg-default-50 rounded-lg flex items-center gap-3 border border-default-200">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => {
                        const audio = new Audio(audioUrl);
                        audio.play();
                      }}
                    >
                      <Icon icon="solar:play-circle-bold" />
                    </Button>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs truncate text-default-500">
                        {audioUrl}
                      </p>
                      {detectingDuration ? (
                        <p className="text-xs text-warning">
                          Detecting duration...
                        </p>
                      ) : (
                        <p className="text-xs text-default-500">
                          Duration: {methods.getValues("duration")}s
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => setValue("audioUrl", "")}
                    >
                      <Icon icon="lucide:x" />
                    </Button>
                  </div>
                )}
                <FileUpload
                  accept="audio/*"
                  label="Upload Audio File (MP3, M4A, WAV)"
                  onUploadComplete={(url) => setValue("audioUrl", url)}
                />
                <input
                  type="hidden"
                  {...methods.register("audioUrl", {
                    required: "Audio file is required",
                  })}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-default-200 space-y-4">
              <Heading
                className="text-xl font-bold flex items-center gap-2"
                startContent={
                  <Icon icon="solar:settings-bold" className="text-primary" />
                }
              >
                Settings
              </Heading>

              <AutocompleteInput
                name="status"
                label="Status"
                required={true}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Archived", value: "archived" },
                ]}
                isClearable={false}
              />

              <DatePickerInput
                name="publishedAt"
                label="Publish Date"
                required={false}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Episode Thumbnail</label>
                {thumbnailUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-default-200">
                    <Image
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover"
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      className="absolute top-2 right-2"
                      onPress={() => setValue("thumbnailUrl", "")}
                    >
                      <Icon icon="lucide:x" />
                    </Button>
                  </div>
                ) : null}
                <FileUpload
                  accept="image/*"
                  label="Upload Thumbnail (Optional)"
                  onUploadComplete={(url) => setValue("thumbnailUrl", url)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                color="primary"
                variant="solid"
                type="submit"
                isLoading={isLoading}
                className="flex-1 font-bold"
                startContent={!isLoading && <Icon icon="solar:disk-bold" />}
              >
                Save Episode
              </Button>
              <Button
                variant="flat"
                onPress={() => router.back()}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
