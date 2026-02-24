"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { Heading } from "@/components/heading";
import {
  getRecentActivity,
  RecentActivity as IRecentActivity,
} from "@/features/dashboard/actions";

type ActivityFilter = "all" | "student" | "payment" | "post" | "class";

export function RecentActivity() {
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const { data: activities = [], isLoading } = useQuery<IRecentActivity[]>({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => getRecentActivity(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredActivities = activities.filter(
    (a) => filter === "all" || a.type === filter,
  );

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <Heading as="h3" size="xl" className="text-default-900">
          Recent Activity
        </Heading>
      </div>
      <Card shadow="sm" className="border border-default-100 flex flex-col">
        <CardHeader className="px-5 pt-5 pb-3 flex flex-col items-start gap-3 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-default-400">
            Filter by Category
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Students", value: "student" },
              { label: "Payments", value: "payment" },
              { label: "Articles", value: "post" },
              { label: "Classes", value: "class" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as ActivityFilter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === f.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-default-100 text-default-600 hover:bg-default-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-5 py-4 gap-4 overflow-y-auto max-h-[480px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-default-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-default-300">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-lg mt-1" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3 w-3/4 rounded-lg" />
                  <Skeleton className="h-2 w-1/4 rounded-lg" />
                </div>
              </div>
            ))
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity, i) => (
              <div key={i} className="flex gap-3">
                <div className={`mt-1 ${activity.color}`}>
                  <Icon icon={activity.icon} className="text-lg" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-default-700">
                    {activity.text}
                  </span>
                  <span className="text-xs text-default-400">
                    {formatDistanceToNow(new Date(activity.date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon
                icon="solar:info-circle-bold-duotone"
                className="text-3xl text-default-300 mb-2"
              />
              <span className="text-sm text-default-400">
                No recent activity in the last 2 weeks
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
