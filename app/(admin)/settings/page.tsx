"use client";

import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Toast } from "@/components/toast";
import { SystemSetting } from "@/features/settings/interfaces";
import { Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { AuthTab } from "@/features/settings/components/AuthTab";
import { MaintenanceTab } from "@/features/settings/components/MaintenanceTab";
import { useGetIdentity } from "@/hooks/useGetIdentity";

type TabId = "general" | "maintenance" | "advanced" | "auth";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("maintenance");

  // Use Clerk's useUser to get the publicMetadata where role is stored
  const { user } = useGetIdentity();
  const isDev = user?.role === "DEVELOPER";
  const isReadOnly = !isDev;

  const {
    data: settings = [],
    isLoading,
    error,
  } = useQuery<SystemSetting[]>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings?format=list");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const body = {
        settings: {
          [payload.key]: payload.value,
        },
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Settings updated successfully",
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err: unknown) => {
      Toast({
        title: "Error",
        description: (err as Error).message,
        color: "danger",
      });
    },
  });

  const handleUpdate = (key: string, value: string) => {
    updateMutation.mutate({ key, value });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
      <LoadingScreen isLoading={isLoading} />
      <div className="flex flex-col gap-2">
        <Heading className="text-2xl font-bold">System Settings</Heading>
        <Text className="text-default-500">
          Manage global configurations and maintenance mode.
        </Text>
        {isReadOnly && (
          <div className="mt-2 p-3 bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300 rounded-lg border border-warning-200 dark:border-warning-900/50 flex items-start gap-3">
            <Icon
              icon="solar:shield-warning-bold"
              className="w-5 h-5 shrink-0 mt-0.5"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                Read-only Mode Active
              </span>
              <span className="text-xs opacity-90 mt-0.5">
                Settings configuration and modifications are strictly restricted
                to Developer accounts only.
              </span>
            </div>
          </div>
        )}
      </div>

      <Tabs
        aria-label="Settings Options"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as TabId)}
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        <Tab
          key="maintenance"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:shield-warning-bold" width={20} />
              <span>Maintenance</span>
            </div>
          }
        >
          <MaintenanceTab
            settings={settings}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
            isReadOnly={isReadOnly}
          />
        </Tab>

        <Tab
          key="auth"
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="solar:lock-keyhole-bold" width={20} />
              <span>Authorization</span>
            </div>
          }
        >
          <AuthTab
            settings={settings}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
            isReadOnly={isReadOnly}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
