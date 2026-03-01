"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface Changelog {
  id: string;
  title: string;
  content: string;
  type: "FEATURE" | "BUG_FIX" | "IMPROVEMENT" | "UPDATE";
  version: string;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  FEATURE: "success",
  BUG_FIX: "danger",
  IMPROVEMENT: "warning",
  UPDATE: "primary",
};

export function ChangelogNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const { data } = useQuery<{ success: boolean; data: Changelog[] }>({
    queryKey: ["latest-changelog"],
    queryFn: async () => {
      const res = await fetch("/api/change-logs?isPublished=true&limit=1");
      return res.json();
    },
  });

  const latestChangelog = data?.data?.[0];

  useEffect(() => {
    if (latestChangelog) {
      const closedId = localStorage.getItem("closedChangelogId");
      if (closedId !== latestChangelog.id) {
        setIsVisible(true);
      }
    }
  }, [latestChangelog]);

  const handleClose = () => {
    if (latestChangelog) {
      localStorage.setItem("closedChangelogId", latestChangelog.id);
    }
    setIsVisible(false);
    setIsClosed(true);
  };

  if (!latestChangelog || isClosed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="shadow-lg border border-default-200 dark:border-default-100">
            <CardBody className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <Icon
                      icon="lucide:rocket"
                      className="w-5 h-5 text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">New Update!</p>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={typeColors[latestChangelog.type] as any}
                    >
                      {latestChangelog.type.replace("_", " ")} - v
                      {latestChangelog.version}
                    </Chip>
                  </div>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleClose}
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3">
                <p className="font-medium text-default-900 dark:text-default-100">
                  {latestChangelog.title}
                </p>
                <p className="text-sm text-default-500 mt-1 line-clamp-2">
                  {latestChangelog.content}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
