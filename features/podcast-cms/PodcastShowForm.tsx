"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { CreatePodcastShowData, PodcastShowDetail } from "./interfaces";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs/TextInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput";
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { Heading } from "@/components/heading";
import FileUpload from "@/components/inputs/FileUpload";
import Image from "next/image";

interface PodcastShowFormProps {
  initialData?: PodcastShowDetail;
  authors?: { id: string; fullName: string }[];
  onSubmit: (data: CreatePodcastShowData) => Promise<void>;
  isLoading?: boolean;
}

export default function PodcastShowForm({
  initialData,
  authors = [],
  onSubmit,
  isLoading = false,
}: PodcastShowFormProps) {
  const router = useRouter();
  const methods = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      coverImage: initialData?.coverImage || "",
      status: initialData?.status || "draft",
      authorId: initialData?.authorId || "",
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : "",
    },
  });
  const { handleSubmit, setValue } = methods;

  const coverImage = useWatch({ control: methods.control, name: "coverImage" });

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
                Show Details
              </Heading>

              <TextInput
                name="title"
                label="Title"
                placeholder="Enter show title"
                validation={{ required: "Title is required" }}
              />

              <TextareaInput
                name="description"
                label="Description"
                placeholder="Enter show description"
                required={false}
                minRows={4}
              />
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
                <label className="text-sm font-medium">Cover Image</label>
                {coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-default-200">
                    <Image
                      src={coverImage}
                      alt="Cover preview"
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
                      onPress={() => setValue("coverImage", "")}
                    >
                      <Icon icon="lucide:x" />
                    </Button>
                  </div>
                ) : null}
                <FileUpload
                  accept="image/*"
                  label="Upload Cover Image"
                  onUploadComplete={(url) => setValue("coverImage", url)}
                />
              </div>

              {/* Author Selection */}
              {authors.length > 0 && (
                <AutocompleteInput
                  name="authorId"
                  label="Author"
                  placeholder="Select author"
                  required={false}
                  options={authors.map((author) => ({
                    label: author.fullName,
                    value: author.id,
                  }))}
                />
              )}
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
                Save Show
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
