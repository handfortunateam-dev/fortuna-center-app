"use client";

import StatCard from "@/components/ui/StatCard";
import React from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { Heading } from "@/components/heading";
import { Badge, Spinner } from "@heroui/react";

export default function StatisticGeneral() {
  const { lms, personnel } = useDashboardStats();

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

      {/* Personnel & Logistics Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heading as="h3" size="lg" className="font-bold text-default-800">
            Personnel & Logistics
          </Heading>
          <Badge color="secondary" variant="flat" size="sm">
            Staffing
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Teachers"
            value={
              personnel.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                personnel.totalTeachers.toLocaleString()
              )
            }
            change="Registered educators"
            icon="solar:user-id-bold"
            bgColor="bg-purple-500/10"
            textColor="text-purple-600"
            delay={0.4}
          />
          <StatCard
            title="Total Users Accounts"
            value={
              personnel.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                personnel.totalUsers.toLocaleString()
              )
            }
            change="All system accounts"
            icon="solar:users-group-two-rounded-bold"
            bgColor="bg-purple-600/10"
            textColor="text-purple-700"
            delay={0.5}
          />
          <StatCard
            title="Active Schedules"
            value={
              personnel.isLoading ? (
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                  size="sm"
                />
              ) : (
                personnel.totalSchedules.toLocaleString()
              )
            }
            change="Class routines set"
            icon="solar:calendar-date-bold"
            bgColor="bg-purple-700/10"
            textColor="text-purple-800"
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
}
