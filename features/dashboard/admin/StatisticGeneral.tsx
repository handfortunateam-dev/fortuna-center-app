"use client";

import StatCard from "@/components/ui/StatCard";
import React from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { Heading } from "@/components/heading";
import { Badge, Spinner } from "@heroui/react";

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
            value={
              lms.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                lms.totalStudents.toLocaleString()
              )
            }
            change="+12% from last month"
            icon="solar:users-group-rounded-bold"
            bgColor="bg-blue-500/10"
            textColor="text-blue-600"
            delay={0.1}
          />
          <StatCard
            title="Total Classes"
            value={
              lms.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                lms.totalClasses.toString()
              )
            }
            change="Active programs"
            icon="solar:book-bookmark-bold"
            bgColor="bg-blue-600/10"
            textColor="text-blue-700"
            delay={0.2}
          />
          <StatCard
            title="Active Sessions"
            value={
              lms.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                lms.activeClasses.toString()
              )
            }
            change={
              lms.activeClasses > 0 ? "ongoing right now" : "No live classes"
            }
            icon="solar:play-circle-bold"
            bgColor="bg-blue-700/10"
            textColor="text-blue-800"
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
              broadcast.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                Number(broadcast.subscribers).toLocaleString()
              )
            }
            change="YouTube Channel"
            icon="solar:user-heart-bold"
            bgColor="bg-slate-500/10"
            textColor="text-slate-700"
            delay={0.4}
          />
          <StatCard
            title="Total Views"
            value={
              broadcast.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                Number(broadcast.totalViews).toLocaleString()
              )
            }
            change="All time reach"
            icon="solar:eye-bold"
            bgColor="bg-slate-600/10"
            textColor="text-slate-800"
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
            icon="solar:shield-check-bold"
            bgColor={
              broadcast.isQuotaExceeded ? "bg-red-500/10" : "bg-slate-700/10"
            }
            textColor={
              broadcast.isQuotaExceeded ? "text-red-600" : "text-slate-900"
            }
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
}
