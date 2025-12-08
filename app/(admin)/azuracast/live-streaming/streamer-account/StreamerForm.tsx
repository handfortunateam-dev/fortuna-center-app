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
import { Icon } from "@iconify/react";
import {
  CreateStreamerPayload,
  Streamer,
} from "@/services/azurecast/interfaces";
import {
  createStreamer,
  updateStreamer,
} from "@/services/azurecast/azuracastPrivateService";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Toast";

interface StreamerFormProps {
  initialData?: Streamer;
  isEditing?: boolean;
}

export default function StreamerForm({
  initialData,
  isEditing = false,
}: StreamerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateStreamerPayload>>({
    streamer_username: initialData?.streamer_username || "",
    streamer_password: "", // Password is usually not sent back for security, or we might want to leave it empty if not changing
    display_name: initialData?.display_name || "",
    comments: initialData?.comments || "",
    is_active: initialData?.is_active ?? true,
    enforce_schedule: initialData?.enforce_schedule ?? false,
    schedule_items: initialData?.schedule_items || [],
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isEditing && initialData) {
        await updateStreamer(initialData.id, formData);
        Toast({
          title: "Success",
          description: "Streamer updated successfully",
          color: "success",
        });
      } else {
        await createStreamer(formData as CreateStreamerPayload);
        Toast({
          title: "Success",
          description: "Streamer created successfully",
          color: "success",
        });
      }
      router.push("/azuracast/live-streaming/streamer-account");
      router.refresh();
    } catch (error) {
      console.error("Failed to save streamer:", error);
      Toast({
        title: "Error",
        description: "Failed to save streamer",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardBody>
          <Tabs aria-label="Streamer Options">
            <Tab key="basic" title="Basic Info">
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Streamer Username"
                    placeholder="username"
                    isRequired
                    value={formData.streamer_username}
                    onValueChange={(val) =>
                      setFormData({ ...formData, streamer_username: val })
                    }
                    description="The streamer will use this username to connect to the radio server."
                  />
                  <Input
                    label="Streamer Password"
                    placeholder="password"
                    type="password"
                    isRequired={!isEditing}
                    value={formData.streamer_password}
                    onValueChange={(val) =>
                      setFormData({ ...formData, streamer_password: val })
                    }
                    description="The streamer will use this password to connect to the radio server."
                  />
                </div>
                <Input
                  label="Streamer Display Name"
                  placeholder="Display Name"
                  value={formData.display_name}
                  onValueChange={(val) =>
                    setFormData({ ...formData, display_name: val })
                  }
                  description="This is the informal display name that will be shown in API responses if the streamer/DJ is live."
                />
                <Textarea
                  label="Comments"
                  placeholder="Internal notes..."
                  value={formData.comments}
                  onValueChange={(val) =>
                    setFormData({ ...formData, comments: val })
                  }
                  description="Internal notes or comments about the user, visible only on this control panel."
                />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Account is Active</p>
                    <p className="text-xs text-gray-500">
                      Enable to allow this account to log in and stream.
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.is_active}
                    onValueChange={(val) =>
                      setFormData({ ...formData, is_active: val })
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Enforce Schedule Times</p>
                    <p className="text-xs text-gray-500">
                      If enabled, this streamer will only be able to connect
                      during their scheduled broadcast times.
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.enforce_schedule}
                    onValueChange={(val) =>
                      setFormData({ ...formData, enforce_schedule: val })
                    }
                  />
                </div>
              </div>
            </Tab>
            <Tab key="schedule" title="Schedule">
              <div className="space-y-4 pt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                    Scheduled Time #1
                  </h3>
                  <Button size="sm" color="danger" variant="flat">
                    REMOVE
                  </Button>
                </div>
                {/* Placeholder for schedule inputs - implementing full schedule UI is complex */}
                <p className="text-sm text-gray-500">
                  Schedule management is simplified for this demo.
                </p>
                <Button
                  color="primary"
                  startContent={<Icon icon="lucide:plus" />}
                >
                  ADD SCHEDULE ITEM
                </Button>
              </div>
            </Tab>
            <Tab key="artwork" title="Artwork">
              <div className="space-y-4 pt-4">
                <p className="font-medium">Select PNG/JPG artwork file</p>
                <div className="flex gap-2">
                  <Input type="file" accept="image/png, image/jpeg" />
                </div>
                <p className="text-xs text-gray-500">
                  This image will be used as the default album art when this
                  streamer is live.
                </p>
              </div>
            </Tab>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="flat"
              onPress={() =>
                router.push("/azuracast/live-streaming/streamer-account")
              }
            >
              CANCEL
            </Button>
            <Button color="danger" onPress={handleSave} isLoading={isLoading}>
              SAVE CHANGES
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
