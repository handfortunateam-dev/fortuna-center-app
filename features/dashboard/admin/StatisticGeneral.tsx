"use client";

import StatCard from "@/components/ui/StatCard";
import React from "react";
import { useClasses } from "@/services/classesService";

export default function StatisticGeneral() {
  const { data: classesResponse, isLoading } = useClasses({
    limit: 100, // Fetch enough to count
  });

  const classes = classesResponse?.data || [];

  // Compute some basic stats from available data
  const activeSessions = classes.filter((c) => c.isActive).length;
  const totalClasses = classes.length;

  // Fallback / Mock calculations for demo purposes until real analytics API exists
  // In a real app, these would come from an analytics endpoint
  const totalViewers = activeSessions * 120 + 450;
  const peakViewers = activeSessions > 0 ? 1200 + activeSessions * 50 : 0;

  const stats = [
    {
      title: "Active Sessions",
      value: isLoading ? "..." : activeSessions.toString(),
      change: activeSessions > 0 ? "Live now" : "Offline",
      icon: "solar:play-circle-bold-duotone",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100 dark:bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Classes",
      value: isLoading ? "..." : totalClasses.toString(),
      change: "+Today",
      icon: "solar:black-hole-bold-duotone",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Active Learners",
      value: isLoading ? "..." : (totalClasses * 15).toLocaleString(), // Mock estimation
      change: "+12%",
      icon: "solar:users-group-rounded-bold-duotone",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-100 dark:bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Courses",
      value: "8", // This could also be fetched dynamically
      change: "Stable",
      icon: "solar:book-bookmark-bold-duotone",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-500/10",
      textColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            bgColor={stat.bgColor}
            textColor={stat.textColor}
            delay={index * 0.1}
          />
        ))}
      </div>
    </>
  );
}
