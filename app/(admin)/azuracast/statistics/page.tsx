"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody, Tabs, Tab } from "@heroui/react";
import {
  DashboardChartsResponse,
  ChartSection,
} from "@/services/azurecast/interfaces";
import { getDashboardCharts } from "@/services/azurecast/azuracastPrivateService";
import { PageHeader } from "@/components/ui/Common/PageHeader";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-2 rounded shadow-lg text-xs">
        <p className="font-bold mb-1">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatisticsPage() {
  const [chartsData, setChartsData] = useState<DashboardChartsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardCharts();
        setChartsData(data);
      } catch (error) {
        console.error("Failed to fetch charts data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading statistics...</div>;
  }

  if (!chartsData) {
    return <div className="p-6">Failed to load statistics.</div>;
  }

  const formatChartData = (section: ChartSection) => {
    // Assuming single metric series for now based on example
    const metric = section.metrics[0];
    if (!metric) return [];

    return metric.data.map((point) => ({
      date: point.x, // Timestamp
      value: point.y,
    }));
  };

  const averageData = formatChartData(chartsData.average);
  const uniqueData = formatChartData(chartsData.unique);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Statistics"
        description="View listener statistics over time."
      />

      <Card className="bg-gray-100 dark:bg-gray-800 border-gray-800">
        <CardBody>
          <Tabs
            aria-label="Statistics Options"
            color="primary"
            variant="underlined"
          >
            <Tab key="average" title="Average Listeners">
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={averageData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(unixTime) =>
                        new Date(unixTime).toLocaleDateString()
                      }
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="fortuna-center"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tab>
            <Tab key="unique" title="Unique Listeners">
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={uniqueData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(unixTime) =>
                        new Date(unixTime).toLocaleDateString()
                      }
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="fortuna-center"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
