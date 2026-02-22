"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AuthUser } from "@/lib/auth/getAuthUser";
import { Tabs, Tab } from "@heroui/react";
import QuickActions from "./QuickActions";
import RecentSessions from "./RecentSessions";
import StatisticGeneral from "./StatisticGeneral";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { RecentActivity } from "../components/RecentActivity";

interface DashboardAdminProps {
  user: AuthUser | null;
}

export default function DashboardAdmin({ user }: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading as="h1" size="3xl" className="font-bold text-default-900">
            Dashboard
          </Heading>
          <Text className="text-default-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s
            what&apos;s happening with your broadcasts.
          </Text>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
        >
          <Tab key="dashboard" title="Dashboard" />
          <Tab key="sessions" title="Recent Sessions" />
          {/* Add more tabs as needed for specific data views */}
        </Tabs>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <StatisticGeneral />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Stats & Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                  <QuickActions />
                  <RecentSessions limit={5} />
                </div>
              </div>

              {/* Right Column: Recent Activity */}
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-6">
            <RecentSessions limit={10} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
