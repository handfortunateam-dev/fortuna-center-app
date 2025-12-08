"use client";
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import CardMotion from "@/components/motion/CardMotion";

export default function QuickActions() {
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

  return (
    <>
      {/* Quick Actions */}
      <CardMotion delay={0.5} direction="left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-default-900">
              Quick Actions
            </h2>
            <p className="text-default-500 text-sm mt-1">Common tasks</p>
          </div>
          <Icon
            icon="solar:widget-5-bold-duotone"
            className="text-2xl text-primary"
          />
        </div>
        <div className="space-y-3">
          {[
            {
              title: "Create New Session",
              icon: "solar:add-circle-bold",
              color: "text-blue-400",
              bgColor: "bg-blue-500/10",
            },
            {
              title: "View Analytics",
              icon: "solar:chart-2-bold",
              color: "text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              title: "Manage Settings",
              icon: "solar:settings-bold",
              color: "text-green-400",
              bgColor: "bg-green-500/10",
            },
            {
              title: "Export Reports",
              icon: "solar:download-bold",
              color: "text-amber-400",
              bgColor: "bg-amber-500/10",
            },
            {
              title: "Connect YouTube",
              icon: "solar:videocamera-record-bold",
              color: "text-red-500",
              bgColor: "bg-red-500/10",
              onClick: handleConnectYouTube,
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 hover:border-default-300 transition-all group"
            >
              <div className={`p-3 rounded-xl ${action.bgColor}`}>
                <Icon
                  icon={action.icon}
                  className={`text-xl ${action.color}`}
                />
              </div>
              <span className="text-default-700 font-medium flex-1 text-left">
                {action.title}
              </span>
              <Icon
                icon="solar:alt-arrow-right-bold"
                className="text-default-400 group-hover:text-default-900 group-hover:translate-x-1 transition-all"
              />
            </button>
          ))}
        </div>
      </CardMotion>
    </>
  );
}
