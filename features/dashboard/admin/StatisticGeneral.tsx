"use client";

import StatCard from "@/components/ui/StatCard";
import React from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { Heading } from "@/components/heading";
import { Badge } from "@heroui/react";

export default function StatisticGeneral() {
  const { lms, broadcast } = useDashboardStats();

  return (
    <div className="space-y-8">
      {/* LMS Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heading as="h3" size="lg" className="font-bold text-default-800">
            LMS Overview
          </Heading>
          <Badge color="primary" variant="flat" size="sm">
            Learning Management
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={lms.isLoading ? "..." : lms.totalStudents.toLocaleString()}
            change="+12% from last month"
            icon="solar:users-group-rounded-bold-duotone"
            bgColor="bg-blue-100 dark:bg-blue-500/10"
            textColor="text-blue-600 dark:text-blue-400"
            delay={0.1}
          />
          <StatCard
            title="Total Classes"
            value={lms.isLoading ? "..." : lms.totalClasses.toString()}
            change="Active programs"
            icon="solar:black-hole-bold-duotone"
            bgColor="bg-purple-100 dark:bg-purple-500/10"
            textColor="text-purple-600 dark:text-purple-400"
            delay={0.2}
          />
          <StatCard
            title="Active Sessions"
            value={lms.isLoading ? "..." : lms.activeClasses.toString()}
            change={
              lms.activeClasses > 0 ? "ongoing right now" : "No live classes"
            }
            icon="solar:play-circle-bold-duotone"
            bgColor="bg-green-100 dark:bg-green-500/10"
            textColor="text-green-600 dark:text-green-400"
            delay={0.3}
          />
        </div>
      </section>

      {/* Broadcast Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heading as="h3" size="lg" className="font-bold text-default-800">
            Broadcast Channel
          </Heading>
          <Badge color="danger" variant="flat" size="sm">
            YouTube Insights
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Subscribers"
            value={
              broadcast.isLoading
                ? "..."
                : Number(broadcast.subscribers).toLocaleString()
            }
            change="YouTube Channel"
            icon="solar:star-bold-duotone"
            bgColor="bg-amber-100 dark:bg-amber-500/10"
            textColor="text-amber-600 dark:text-amber-400"
            delay={0.4}
          />
          <StatCard
            title="Total Views"
            value={
              broadcast.isLoading
                ? "..."
                : Number(broadcast.totalViews).toLocaleString()
            }
            change="All time reach"
            icon="solar:eye-bold-duotone"
            bgColor="bg-red-100 dark:bg-red-500/10"
            textColor="text-red-600 dark:text-red-400"
            delay={0.5}
          />
          <StatCard
            title="Quota Status"
            value={broadcast.isQuotaExceeded ? "Exceeded" : "Healthy"}
            change={
              broadcast.isQuotaExceeded
                ? "Needs attention"
                : "API fully operational"
            }
            icon="solar:heart-pulse-bold-duotone"
            bgColor={
              broadcast.isQuotaExceeded
                ? "bg-red-100 dark:bg-red-500/20"
                : "bg-cyan-100 dark:bg-cyan-500/10"
            }
            textColor={
              broadcast.isQuotaExceeded
                ? "text-red-600"
                : "text-cyan-600 dark:text-cyan-400"
            }
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
}
