"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Changelog } from "@/features/change-logs/interfaces";
import { changelogTypeColors } from "@/features/change-logs/constants";

const STORAGE_KEY = "changelog_notification_cache";

function isDismissed(id: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const cache = JSON.parse(raw) as { dismissedId: string };
    return cache.dismissedId === id;
  } catch {
    return false;
  }
}

function setDismissed(id: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ dismissedId: id, dismissedAt: Date.now() }),
  );
}

export function ChangelogNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [, startTransition] = useTransition();

  const { data } = useQuery<{ success: boolean; data: Changelog[] }>({
    queryKey: ["latest-changelog"],
    queryFn: async () => {
      const res = await fetch("/api/change-logs?isPublished=true&limit=1");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const latestChangelog = data?.data?.[0];

  useEffect(() => {
    if (latestChangelog && !isDismissed(latestChangelog.id)) {
      const timer = setTimeout(() => {
        startTransition(() => setIsVisible(true));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [latestChangelog, startTransition]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (latestChangelog) setDismissed(latestChangelog.id);
  }, [latestChangelog]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(handleClose, 12_000);
    return () => clearTimeout(timer);
  }, [isVisible, handleClose]);

  if (!latestChangelog || isDismissed(latestChangelog.id)) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 w-72"
        >
          <div className="rounded-xl border border-default-200 dark:border-default-100 bg-white dark:bg-gray-900 shadow-md">
            <div className="px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-default-400">
                    v{latestChangelog.version}
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      changelogTypeColors[latestChangelog.type] as
                        | "primary"
                        | "success"
                        | "warning"
                        | "danger"
                    }
                    classNames={{
                      base: "h-4.5",
                      content: "text-[10px] font-medium px-1",
                    }}
                  >
                    {latestChangelog.type.replace("_", " ")}
                  </Chip>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  className="w-6 h-6 min-w-6 text-default-400"
                  onPress={handleClose}
                >
                  <Icon icon="lucide:x" className="w-3 h-3" />
                </Button>
              </div>

              <p className="mt-1.5 text-sm font-medium text-default-800 dark:text-default-100 truncate">
                {latestChangelog.title}
              </p>
              <p className="mt-0.5 text-xs text-default-500 line-clamp-2 leading-relaxed">
                {latestChangelog.content}
              </p>
            </div>

            {/* Auto-dismiss progress */}
            <div className="h-0.5 bg-default-100 dark:bg-default-50 overflow-hidden rounded-b-xl">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 12, ease: "linear" }}
                className="h-full bg-primary/40 origin-left"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
