"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  Switch,
  Tabs,
  Tab,
  Card,
  CardBody,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Chip,
} from "@heroui/react";
import {
  PodcastPlaylist,
  CreatePodcastPayload,
} from "@/services/azurecast/interfaces";
import {
  createPodcast,
  getPodcastPlaylists,
} from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Toast";

interface PodcastCreateFormProps {
  languageOptions: Record<string, string>;
  categoriesOptions: {
    value: string;
    text: string;
    description: string | null;
  }[];
}

export default function PodcastCreateForm({
  languageOptions,
  categoriesOptions,
}: PodcastCreateFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [playlists, setPlaylists] = useState<PodcastPlaylist[]>([]);
  const [formData, setFormData] = useState<CreatePodcastPayload>({
    title: "",
    link: "",
    description: "",
    language: "en",
    author: "",
    email: "",
    categories: [],
    is_enabled: true,
    explicit: false,
    branding_config: {
      public_custom_html: null,
      enable_op3_prefix: false,
    },
    source: "manual",
    playlist_id: null,
    playlist_auto_publish: true,
    artwork_file: null,
  });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getPodcastPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    if (name.startsWith("branding_config.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        branding_config: {
          ...prev.branding_config,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createPodcast(formData);
      Toast({
        title: "Success",
        description: "Podcast created successfully",
        color: "success",
      });
      router.refresh();
      router.back();
    } catch (error) {
      console.error("Failed to create podcast:", error);
      Toast({
        title: "Error",
        description: "Failed to create podcast",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add Podcast</h1>
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          className="text-gray-500"
        >
          ✕
        </Button>
      </div>

      <Tabs aria-label="Podcast Options">
        <Tab key="basic" title="Basic Information">
          <Card>
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Podcast Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  isRequired
                  placeholder="Podcast Title"
                />
                <Input
                  label="Website"
                  name="link"
                  value={formData.link || ""}
                  onChange={handleInputChange}
                  placeholder="http://example.com"
                  description="Typically the home page of a podcast."
                />
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                isRequired
                placeholder="Podcast Description"
                description="The description of your podcast. The typical maximum amount of text allowed for this is 4000 characters."
              />

              <Autocomplete
                label="Language"
                selectedKey={formData.language}
                onSelectionChange={(key) => {
                  setFormData((prev) => ({
                    ...prev,
                    language: (key as string) || "",
                  }));
                }}
                isRequired
              >
                {Object.entries(languageOptions).map(([key, label]) => (
                  <AutocompleteItem key={key}>{label}</AutocompleteItem>
                ))}
              </Autocomplete>
              <p className="text-xs text-gray-500">
                The language spoken on the podcast.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Author"
                  name="author"
                  value={formData.author || ""}
                  onChange={handleInputChange}
                  placeholder="Author Name"
                  description="The contact person of the podcast. May be required in order to list the podcast on services like Apple Podcasts, Spotify, Google Podcasts, etc."
                />
                <Input
                  label="E-Mail"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  placeholder="author@example.com"
                  description="The email of the podcast contact. May be required in order to list the podcast on services like Apple Podcasts, Spotify, Google Podcasts, etc."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Categories</label>
                <div className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.categories || []).map((catValue) => {
                      const catOption = categoriesOptions.find(
                        (c) => c.value === catValue
                      );
                      return (
                        <Chip
                          key={catValue}
                          onClose={() => {
                            setFormData((prev) => ({
                              ...prev,
                              categories: (prev.categories || []).filter(
                                (c) => c !== catValue
                              ),
                            }));
                          }}
                          variant="flat"
                        >
                          {catOption ? catOption.text : catValue}
                        </Chip>
                      );
                    })}
                  </div>
                  <Autocomplete
                    label="Add Category"
                    placeholder="Search and select a category"
                    onSelectionChange={(key) => {
                      if (key) {
                        setFormData((prev) => ({
                          ...prev,
                          categories: [
                            ...(prev.categories || []),
                            key as string,
                          ],
                        }));
                      }
                    }}
                    selectedKey={null}
                    key={`category-select-${
                      (formData.categories || []).length
                    }`}
                  >
                    {categoriesOptions
                      .filter(
                        (cat) =>
                          !(formData.categories || []).includes(cat.value)
                      )
                      .map((cat) => (
                        <AutocompleteItem key={cat.value} textValue={cat.text}>
                          <div className="flex flex-col">
                            <span className="text-small">{cat.text}</span>
                            {cat.description && (
                              <span className="text-tiny text-default-400">
                                {cat.description}
                              </span>
                            )}
                          </div>
                        </AutocompleteItem>
                      ))}
                  </Autocomplete>
                </div>
                <p className="text-xs text-gray-500">
                  Select the category/categories that best reflects the content
                  of your podcast.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.is_enabled}
                  onValueChange={(val) => handleSwitchChange("is_enabled", val)}
                >
                  Enable on Public Pages
                </Switch>
              </div>
              <p className="text-xs text-gray-500">
                If disabled, the station will not be visible on public-facing
                pages or APIs.
              </p>

              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.explicit}
                  onValueChange={(val) => handleSwitchChange("explicit", val)}
                >
                  Contains explicit content
                </Switch>
              </div>
              <p className="text-xs text-gray-500">
                Indicates the presence of explicit content (explicit language or
                adult content). Apple Podcasts displays an Explicit parental
                advisory graphic for your podcast if turned on. Podcasts
                containing explicit material aren&apos;t available in some Apple
                Podcasts territories.
              </p>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="source" title="Source">
          <Card>
            <CardBody className="gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Source*</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="source_manual"
                      name="source"
                      value="manual"
                      checked={formData.source === "manual"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, source: "manual" }))
                      }
                    />
                    <label htmlFor="source_manual">Manually Add Episodes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="source_playlist"
                      name="source"
                      value="playlist"
                      checked={formData.source === "playlist"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, source: "playlist" }))
                      }
                    />
                    <label htmlFor="source_playlist">
                      Synchronize with Playlist
                    </label>
                  </div>
                </div>
              </div>

              {formData.source === "playlist" && (
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                    Playlist-Based Podcast
                  </h3>
                  <p className="mb-4 text-sm">
                    Playlist-based podcasts will automatically sync with the
                    contents of a playlist, creating new podcast episodes for
                    any media added to the playlist.
                  </p>

                  <Select
                    label="Select Playlist"
                    selectedKeys={
                      formData.playlist_id
                        ? [formData.playlist_id.toString()]
                        : []
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        playlist_id: parseInt(e.target.value),
                      }))
                    }
                  >
                    {playlists.map((playlist) => (
                      <SelectItem key={playlist.value}>
                        {playlist.text}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="mt-4 flex items-center gap-2">
                    <Switch
                      isSelected={formData.playlist_auto_publish}
                      onValueChange={(val) =>
                        handleSwitchChange("playlist_auto_publish", val)
                      }
                    >
                      Automatically Publish New Episodes
                    </Switch>
                  </div>
                  <p className="text-xs text-gray-500">
                    Whether new episodes should be marked as published or held
                    for review as unpublished.
                  </p>
                </div>
              )}
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
                    disabled
                    placeholder="No file chosen"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Artwork must be a minimum size of 1400 x 1400 pixels and a
                    maximum size of 3000 x 3000 pixels for Apple Podcasts.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="branding" title="Branding">
          <Card>
            <CardBody className="gap-4">
              <p>Branding configuration options.</p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="flat" onPress={() => router.back()}>
          CLOSE
        </Button>
        <Button color="primary" isLoading={isSaving} onPress={handleSave}>
          SAVE CHANGES
        </Button>
      </div>
    </div>
  );
}
