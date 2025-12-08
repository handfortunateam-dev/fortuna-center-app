"use client";

import CardMotion from "@/components/motion/CardMotion";
import ListItemMotion from "@/components/motion/ListItemMotion";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Icon } from "@iconify/react";
import { useClasses } from "@/services/classesService";
import { formatDistanceToNow } from "date-fns";

interface RecentSessionsProps {
  limit?: number;
}

export default function RecentSessions({ limit = 5 }: RecentSessionsProps) {
  // Fetch classes - assuming "Sessions" roughly translates to Classes in the new system
  // We can filter by isActive to show "Live" ones if 'isActive' implies live status,
  // or just show latest.
  const { data: classesResponse, isLoading } = useClasses({
    page: 1,
    limit: limit,
    sort: "createdAt", // Assuming API supports sorting
    // isActive: true, // Optional: uncomment if we only want active/live sessions
  });

  const recentSessions = classesResponse?.data || [];

  return (
    <CardMotion delay={0.6}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level={2}>Recent Sessions</Heading>
          <Text className="text-default-500 text-sm mt-1">
            Latest classes and broadcasts
          </Text>
        </div>
        <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors">
          View All
          <Icon icon="solar:alt-arrow-right-bold" />
        </button>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-4 text-gray-500">
            Loading sessions...
          </div>
        )}

        {!isLoading && recentSessions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No recent sessions found.
          </div>
        )}

        {recentSessions.map((session, idx) => (
          <ListItemMotion
            key={session.id}
            index={idx}
            baseDelay={0.2}
            staggerDelay={0.1}
            direction="right"
            className="flex items-center gap-4 p-4 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 hover:border-default-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Icon
                icon={
                  session.isActive
                      ? "solar:play-circle-bold"
                      : "solar:stop-circle-bold"
                } 
                className={`text-2xl ${
                  session.isActive ? "text-green-500" : "text-default-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-default-900 font-medium line-clamp-1">
                {session.title}
              </h3>
              <p className="text-default-500 text-sm">
                {session.description || "No description"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-default-400">
                {session.createdAt
                  ? formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })
                  : "Unknown date"}
              </span>
              {session.isActive && (
                <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>

            <Icon
              icon="solar:alt-arrow-right-bold"
              className="text-default-400 group-hover:text-default-900 group-hover:translate-x-1 transition-all"
            />
          </ListItemMotion>
        ))}
      </div>
    </CardMotion>
  );
}
