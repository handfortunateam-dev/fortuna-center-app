"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react";
import { YouTubeAnalyticsData } from "@/services/youtubeService";
import { format, parseISO } from "date-fns";

interface YouTubeAnalyticsChartsProps {
  analyticsData: YouTubeAnalyticsData;
}

export default function YouTubeAnalyticsCharts({
  analyticsData,
}: YouTubeAnalyticsChartsProps) {
  // Transform API Rows to Object Array
  // Headers should be: "day", "views", "estimatedMinutesWatched", "subscribersGained"
  const data = analyticsData.rows.map((row) => {
    return {
      date: row[0] as string, // yyyy-mm-dd
      views: row[1] as number,
      watchTime: Math.round((row[2] as number) || 0),
      subscribers: row[3] as number,
    };
  });

  // Sort by date just in case
  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-4 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-lg">
          <p className="text-sm font-semibold mb-2">
            {format(parseISO(label), "PPP")}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Daily Views</h4>
            <p className="text-tiny uppercase font-bold text-gray-500">
              Last 30 Days
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => format(parseISO(str), "MMM d")}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Watch Time & Subscribers Chart */}
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Watch Time & Subscribers</h4>
            <p className="text-tiny uppercase font-bold text-gray-500">
              Engagement Metrics
            </p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => format(parseISO(str), "dd")}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#82ca9d"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#ffc658"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="watchTime"
                    name="Watch Time (min)"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="subscribers"
                    name="Subs Gained"
                    fill="#ffc658"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
