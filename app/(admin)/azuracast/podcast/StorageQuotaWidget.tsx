"use client";

import React, { useEffect, useState } from "react";
import { Progress, Card, CardBody } from "@heroui/react";
import { StorageQuota } from "@/services/azurecast/interfaces";
import { getStationPodcastsQuota } from "@/services/azurecast/azuracastPrivateService";

interface StorageQuotaWidgetProps {
  isFloating?: boolean;
  className?: string;
}

export default function StorageQuotaWidget({
  isFloating = true,
  className = "",
}: StorageQuotaWidgetProps) {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const data = await getStationPodcastsQuota();
        setQuota(data);
      } catch (error) {
        console.error("Failed to fetch storage quota:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, []);

  if (loading) return null;
  if (!quota) return null;

  // Calculate percentage if not provided or 0
  const percent =
    quota.used_percent > 0
      ? quota.used_percent
      : (parseFloat(quota.used_bytes) / parseFloat(quota.available_bytes)) *
        100;

  const containerClasses = isFloating
    ? "fixed bottom-4 right-4 z-50 w-80"
    : "w-full";

  return (
    <div className={`${containerClasses} ${className}`}>
      <Card className="border border-gray-200 shadow-lg dark:border-gray-700">
        <CardBody className="gap-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Storage Usage</span>
            <span className="text-gray-500">
              {quota.used} / {quota.available}
            </span>
          </div>
          <Progress
            aria-label="Storage Usage"
            size="sm"
            value={percent}
            color={
              percent > 90 ? "danger" : percent > 75 ? "warning" : "success"
            }
            className="max-w-md"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{quota.num_files} files</span>
            <span>{percent.toFixed(1)}% used</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
