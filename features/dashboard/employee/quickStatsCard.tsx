import React from "react";
import StatCard from "@/components/ui/StatCard";
import { Spinner } from "@heroui/react";

interface QuickStatsCardProps {
  stats: {
    students: number;
    classes: number;
    pendingPayments: number;
    publishedArticles: number;
  };
  isLoading: boolean;
}

export default function QuickStatsCard({
  stats,
  isLoading,
}: QuickStatsCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Students"
        value={
          isLoading ? (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="wave"
              size="sm"
            />
          ) : (
            stats.students.toLocaleString()
          )
        }
        change="Total registered"
        icon="solar:users-group-rounded-bold"
        bgColor="bg-blue-500/10"
        textColor="text-blue-600"
        delay={0.1}
      />
      <StatCard
        title="Active Classes"
        value={
          isLoading ? (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="wave"
              size="sm"
            />
          ) : (
            stats.classes.toLocaleString()
          )
        }
        change="Currently ongoing"
        icon="solar:book-bookmark-bold"
        bgColor="bg-purple-500/10"
        textColor="text-purple-600"
        delay={0.2}
      />
      <StatCard
        title="Pending Payments"
        value={
          isLoading ? (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="wave"
              size="sm"
            />
          ) : (
            stats.pendingPayments.toLocaleString()
          )
        }
        change="Requires attention"
        icon="solar:wallet-bold"
        bgColor="bg-danger-500/10"
        textColor="text-danger-600"
        delay={0.3}
      />
      <StatCard
        title="Published Articles"
        value={
          isLoading ? (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="wave"
              size="sm"
            />
          ) : (
            stats.publishedArticles.toLocaleString()
          )
        }
        change="Total published"
        icon="solar:document-text-bold"
        bgColor="bg-success-500/10"
        textColor="text-success-600"
        delay={0.4}
      />
    </div>
  );
}
