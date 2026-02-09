"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Chip, Progress, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { checkQuotaHealth } from "@/services/youtubeService";
import { Toast } from "@/components/toast";

export default function YouTubeUsagePage() {
  const [status, setStatus] = useState<
    "idle" | "checking" | "ok" | "error" | "quota_exceeded"
  >("idle");
  const [message, setMessage] = useState("");

  const handleCheckQuota = async () => {
    setStatus("checking");
    try {
      const result = await checkQuotaHealth();
      if (result.status === "ok") {
        setStatus("ok");
        setMessage("API is operational. Quota is within limits.");
        Toast({ title: "Quota Available", color: "success" });
      } else if (result.status === "quota_exceeded") {
        setStatus("quota_exceeded");
        setMessage(result.message);
        Toast({ title: "Quota Exceeded", color: "danger" });
      } else {
        setStatus("error");
        setMessage(result.message);
        Toast({ title: "API Check Failed", color: "warning" });
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to reach server.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon icon="logos:youtube-icon" />
          API Usage & Quota
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor your YouTube Data API usage and quota limits.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Card */}
        <Card className="md:col-span-2 lg:col-span-2 border-none shadow-md">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Quota Status</h3>
                <p className="text-sm text-gray-500">
                  Real-time health check of your API key.
                </p>
              </div>
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:refresh-bold" />}
                isLoading={status === "checking"}
                onPress={handleCheckQuota}
              >
                Check Now
              </Button>
            </div>

            <div
              className={`rounded-xl p-6 flex items-center gap-4 transition-colors ${
                status === "ok"
                  ? "bg-green-50 border border-green-200"
                  : status === "quota_exceeded"
                  ? "bg-red-50 border border-red-200"
                  : status === "error"
                  ? "bg-orange-50 border border-orange-200"
                  : "bg-gray-100 border border-gray-200"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  status === "ok"
                    ? "bg-green-100 text-green-600"
                    : status === "quota_exceeded"
                    ? "bg-red-100 text-red-600"
                    : status === "error"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon
                  icon={
                    status === "ok"
                      ? "solar:check-circle-bold"
                      : status === "quota_exceeded"
                      ? "solar:close-circle-bold"
                      : status === "error"
                      ? "solar:danger-circle-bold"
                      : "solar:question-circle-bold"
                  }
                />
              </div>
              <div>
                <h4
                  className={`font-bold text-lg ${
                    status === "ok"
                      ? "text-green-700"
                      : status === "quota_exceeded"
                      ? "text-red-700"
                      : status === "error"
                      ? "text-orange-700"
                      : "text-gray-700"
                  }`}
                >
                  {status === "idle"
                    ? "Click check to verify status"
                    : status === "checking"
                    ? "Verifying API..."
                    : status === "ok"
                    ? "Operational"
                    : status === "quota_exceeded"
                    ? "Quota Exceeded"
                    : "Connection Error"}
                </h4>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  className="w-full bg-gray-100 dark:bg-gray-800"
                  endContent={<Icon icon="lucide:external-link" />}
                >
                  View Detailed Quota in Cloud Console
                </Button>
              </a>
            </div>
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-900">
          <CardBody className="p-6">
            <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Icon icon="solar:info-circle-bold" />
              Quota Limits
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Daily Limit
                  </span>
                  <span className="font-bold">10,000 units</span>
                </div>
                <Progress
                  value={100}
                  size="sm"
                  color="danger"
                  className="opacity-50"
                />
              </div>

              <Divider className="my-2" />

              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                Cost Breakdown
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between">
                  <span>List (Videos/Playlists)</span>
                  <Chip size="sm" variant="flat" color="success">
                    1 unit
                  </Chip>
                </li>
                <li className="flex justify-between">
                  <span>Search</span>
                  <Chip size="sm" variant="flat" color="warning">
                    100 units
                  </Chip>
                </li>
                <li className="flex justify-between">
                  <span>Video Upload</span>
                  <Chip size="sm" variant="flat" color="danger">
                    1600 units
                  </Chip>
                </li>
                <li className="flex justify-between">
                  <span>Channel Update</span>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-orange-100 text-orange-700"
                  >
                    50 units
                  </Chip>
                </li>
              </ul>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                  <strong>Tip:</strong> Avoid frequent searches. Use direct ID
                  lookups or playlist lists to save quota. Caching is enabled
                  for most getters.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Guide */}
      <Card>
        <CardBody className="p-6">
          <h3 className="font-semibold text-lg mb-4">How to increase quota?</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
            YouTube provides a default quota of 10,000 units per day. If your
            application needs more, you can request a higher quota through the
            Google Cloud Console. Note that this process may take some time and
            requires a review of your application.
          </p>
          <div className="flex gap-4">
            <Button
              as="a"
              href="https://support.google.com/youtube/answer/9937968"
              target="_blank"
              variant="bordered"
              startContent={<Icon icon="solar:book-bookmark-bold" />}
            >
              Read Documentation
            </Button>
            <Button
              as="a"
              href="https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas"
              target="_blank"
              variant="bordered"
              startContent={<Icon icon="logos:google-cloud" />}
            >
              Request Quota Increase
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
