"use client";

import React, { useState } from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Badge,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function NotificationWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["recent-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const result = await res.json();
      return result.data || [];
    },
    enabled: isOpen,
  });

  const notificationCount = data?.length || 0;
  const displayCount = notificationCount > 99 ? "99+" : notificationCount.toString();

  return (
    <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          aria-label="Notifications"
          className="relative text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full w-10 h-10"
        >
          <Badge
            color="danger"
            content={displayCount}
            isInvisible={notificationCount === 0}
            shape="circle"
            placement="top-right"
            size="sm"
          >
            <Icon icon="lucide:bell" className="w-5 h-5" />
          </Badge>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0">
        <div className="flex flex-col w-full">
          <div className="px-4 py-3 border-b border-divider font-semibold text-sm flex justify-between items-center">
            <span>Recent Activity</span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setIsOpen(false)}
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col max-h-[400px] overflow-y-auto">
            {isFetching ? (
              <div className="p-8 flex justify-center items-center">
                <Spinner size="sm" />
              </div>
            ) : data && data.length > 0 ? (
              data.map((item: any) => (
                <div
                  key={item.id}
                  className="px-4 py-3 border-b border-divider last:border-b-0 hover:bg-default-100 transition-colors cursor-default"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-xs text-primary">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-default-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-default-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-default-400 gap-2">
                <Icon icon="lucide:bell-off" className="w-8 h-8 opacity-50" />
                <span className="text-sm">No recent activity</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
