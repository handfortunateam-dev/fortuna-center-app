"use client";
import React from "react";
import { Icon } from "@iconify/react";
import CardWrapper from "@/components/wrappers/card-wrappers";
import { Text } from "@/components/text";
import { useRouter } from "next/navigation";
import { NAV_URL } from "@/constants/url";

interface ActionItem {
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  href?: string;
}

export default function QuickActions() {
  const router = useRouter();

  const handleConnectYouTube = async () => {
    try {
      const response = await fetch("/api/auth/youtube/url");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to get YouTube auth URL:", error);
    }
  };

  const lmsActions: ActionItem[] = [
    {
      title: "Class Scheduler Management",
      icon: "solar:add-circle-bold",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: NAV_URL.ADMIN.SCHEDULER,
    },
    {
      title: "Add Student",
      icon: "solar:user-plus-bold",
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      href: NAV_URL.ADMIN.LMS.STUDENTS,
    },
    {
      title: "Attendance",
      icon: "solar:clipboard-check-bold",
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      href: NAV_URL.ADMIN.LMS.ATTENDANCE,
    },
  ];

  const broadcastActions: ActionItem[] = [
    {
      title: "Go Live",
      icon: "solar:videocamera-record-bold",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      onClick: handleConnectYouTube,
    },
    {
      title: "YouTube Broadcasts",
      icon: "logos:youtube-icon",
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      href: NAV_URL.ADMIN.YOUTUBE.BROADCASTS,
    },
  ];

  const renderAction = (action: ActionItem) => (
    <button
      key={action.title}
      onClick={() => {
        if (action.onClick) action.onClick();
        else if (action.href) router.push(action.href);
      }}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 hover:border-default-300 transition-all group lg:p-4"
    >
      <div className={`p-2.5 rounded-xl ${action.bgColor} lg:p-3`}>
        <Icon icon={action.icon} className={`text-xl ${action.color}`} />
      </div>
      <span className="text-default-700 font-medium flex-1 text-left text-sm lg:text-base">
        {action.title}
      </span>
      <Icon
        icon="solar:alt-arrow-right-bold"
        className="text-default-400 group-hover:text-default-900 group-hover:translate-x-1 transition-all text-sm"
      />
    </button>
  );

  return (
    <CardWrapper
      title="Quick Actions"
      description="Common tasks"
      titleSize="xl"
      className="h-full"
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <Text
            size="xs"
            weight="bold"
            color="muted"
            className="uppercase tracking-widest px-1"
          >
            LMS Management
          </Text>
          <div className="grid grid-cols-1 gap-2">
            {lmsActions.map(renderAction)}
          </div>
        </section>

        <section className="space-y-3">
          <Text
            size="xs"
            weight="bold"
            color="muted"
            className="uppercase tracking-widest px-1"
          >
            Broadcast Control
          </Text>
          <div className="grid grid-cols-1 gap-2">
            {broadcastActions.map(renderAction)}
          </div>
        </section>
      </div>
    </CardWrapper>
  );
}
