"use client";
import React from "react";
import { Icon } from "@iconify/react";
import CardMotion from "@/components/motion/CardMotion";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useRouter } from "next/navigation";

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
      title: "New Session",
      icon: "solar:add-circle-bold",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/admin/scheduler",
    },
    {
      title: "Add Student",
      icon: "solar:user-plus-bold",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      href: "/admin/students?action=create",
    },
    {
      title: "Attendance",
      icon: "solar:calendar-check-bold",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      href: "/admin/attendance",
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
      title: "View Channel",
      icon: "solar:tv-bold",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      href: "/admin/youtube-integration",
    },
    {
      title: "Radio Control",
      icon: "solar:radio-bold",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      href: "/admin/radio-management",
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
    <CardMotion delay={0.5} direction="left" className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading as="h2" size="xl" weight="bold" className="text-default-900">
            Quick Actions
          </Heading>
          <Text size="sm" color="muted" className="mt-1">
            Common tasks
          </Text>
        </div>
        <Icon
          icon="solar:widget-5-bold-duotone"
          className="text-2xl text-primary"
        />
      </div>

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
    </CardMotion>
  );
}
