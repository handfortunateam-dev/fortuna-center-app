"use client";

import { Icon } from "@iconify/react";
import { AuthUser } from "@/lib/auth/getAuthUser";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { NAV_URL } from "@/constants/url";
import { useQuery } from "@tanstack/react-query";
import { getAdministrativeDashboardStats } from "@/features/dashboard/actions";
import QuickStatsCard from "./quickStatsCard";
import { RecentActivity } from "../components/RecentActivity";

interface DashboardEmployeeProps {
  user: AuthUser | null;
}

export default function DashboardEmployee({ user }: DashboardEmployeeProps) {
  const {
    data: stats = {
      students: 0,
      classes: 0,
      pendingPayments: 0,
      publishedArticles: 0,
    },
    isLoading,
  } = useQuery({
    queryKey: ["dashboard", "admin-stats"],
    queryFn: () => getAdministrativeDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const quickActions = [
    {
      name: "Manage Students",
      description: "View and edit student records",
      icon: "solar:user-id-bold-duotone",
      href: NAV_URL.ADMINISTRATIVE.STUDENTS,
      color: "bg-blue-500",
    },
    {
      name: "Class Schedules",
      description: "Manage timelines and instructors",
      icon: "solar:calendar-date-bold-duotone",
      href: NAV_URL.ADMINISTRATIVE.SCHEDULER,
      color: "bg-purple-500",
    },
    {
      name: "Payment History",
      description: "Review course payments",
      icon: "solar:card-2-bold-duotone",
      href: NAV_URL.ADMINISTRATIVE.PAYMENTS,
      color: "bg-emerald-500",
    },
    {
      name: "Post an Article",
      description: "Write announcements or news",
      icon: "solar:pen-bold-duotone",
      href: NAV_URL.ADMINISTRATIVE.POST_ARTICLES,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Heading as="h1" size="3xl" className="text-default-900">
            Administrative Dashboard
          </Heading>
          <Text color="muted" className="mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s an
            overview of our operations today.
          </Text>
        </div>
      </div>

      <QuickStatsCard stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Heading as="h3" size="xl" className="text-default-900">
            Quick Actions
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card
                  isPressable
                  shadow="sm"
                  className="w-full border border-default-100 hover:border-primary/50 transition-colors"
                >
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl text-white shadow-sm shrink-0 ${action.color}`}
                      >
                        <Icon icon={action.icon} className="text-2xl" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-base font-semibold text-default-900">
                          {action.name}
                        </span>
                        <span className="text-xs text-default-500">
                          {action.description}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Activity */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
