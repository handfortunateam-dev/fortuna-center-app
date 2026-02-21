"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Icon } from "@iconify/react";
import StatCard from "@/components/ui/StatCard";
import { Heading } from "@/components/heading";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a855f7",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#10b981",
];

type AnalyticsData = {
  summary: {
    currentMonthRevenue: number;
    currentMonthUnpaid: number;
    totalRevenue: number;
  };
  revenueByClass: { name: string; value: number }[];
  monthlyTrend: { period: string; revenue: number }[];
};

export default function AnalyticsFinancialPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/financial")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((error) => console.error("Error loading financial data", error))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="mb-6">
          <Skeleton className="w-1/4 h-10 rounded-lg" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/10 h-[140px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-12 h-6 rounded-lg" />
              </div>
              <div>
                <Skeleton className="w-24 h-4 rounded-md mb-2" />
                <Skeleton className="w-32 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* 2 Big Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-sm border border-divider">
              <CardHeader className="px-6 py-4 border-b border-divider">
                <Skeleton className="w-1/3 h-6 rounded-md" />
              </CardHeader>
              <CardBody className="p-6 h-[350px]">
                <Skeleton className="w-full h-full rounded-xl" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-12 text-center text-default-500">
        Failed to load financial data
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <Heading title="Financial Analytics"> Financial Analytics</Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Current Month Revenue"
          value={formatCurrency(data.summary.currentMonthRevenue)}
          change="Paid"
          icon="solar:wallet-money-bold-duotone"
          bgColor="bg-success/20"
          textColor="text-success"
          delay={0.1}
        />
        <StatCard
          title="Current Month Unpaid"
          value={formatCurrency(data.summary.currentMonthUnpaid)}
          change="Pending"
          icon="solar:danger-circle-bold-duotone"
          bgColor="bg-danger/20"
          textColor="text-danger"
          delay={0.2}
        />
        <StatCard
          title="Total Historical Revenue"
          value={formatCurrency(data.summary.totalRevenue)}
          change="All Time"
          icon="solar:chart-square-bold-duotone"
          bgColor="bg-primary/20"
          textColor="text-primary"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon
                icon="solar:pie-chart-2-bold-duotone"
                className="text-primary"
              />
              Revenue by Class (Top 10)
            </h3>
          </CardHeader>
          <CardBody className="p-6 h-[350px]">
            {data.revenueByClass.length === 0 ? (
              <div className="flex h-full items-center justify-center text-default-400">
                No payment data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueByClass}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.revenueByClass.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon
                icon="solar:graph-new-up-bold-duotone"
                className="text-secondary"
              />
              Monthly Revenue Trend (Last 6 Months)
            </h3>
          </CardHeader>
          <CardBody className="p-6 h-[350px]">
            {data.monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-default-400">
                No payment data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyTrend}
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#00C49F"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
