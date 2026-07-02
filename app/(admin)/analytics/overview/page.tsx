"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon
          icon="solar:spinner-line-duotone"
          className="w-8 h-8 animate-spin"
        />
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-12 text-center text-default-500">
        Failed to load data
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analytics & Insights Overview
        </h1>
        <p className="text-default-500 text-sm mt-1">
          Get an overview of system users and registrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-50 dark:bg-primary-900/20 shadow-sm">
          <CardBody className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                Total Users
              </p>
              <h3 className="text-3xl font-bold mt-2 text-primary">
                {data.summary.totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                className="w-6 h-6 text-primary"
              />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 dark:bg-success-900/20 shadow-sm">
          <CardBody className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-success-600 dark:text-success-400">
                Total Students
              </p>
              <h3 className="text-3xl font-bold mt-2 text-success">
                {data.summary.totalStudents}
              </h3>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
              <Icon
                icon="solar:user-id-bold-duotone"
                className="w-6 h-6 text-success"
              />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-warning-50 dark:bg-warning-900/20 shadow-sm">
          <CardBody className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-warning-600 dark:text-warning-400">
                Total Teachers
              </p>
              <h3 className="text-3xl font-bold mt-2 text-warning">
                {data.summary.totalTeachers}
              </h3>
            </div>
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
              <Icon
                icon="solar:user-speak-bold-duotone"
                className="w-6 h-6 text-warning"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon
                icon="solar:pie-chart-2-bold-duotone"
                className="text-primary"
              />
              Users by Role
            </h3>
          </CardHeader>
          <CardBody className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="role"
                  label
                >
                  {data.usersByRole.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "#333" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon
                icon="solar:graph-new-up-bold-duotone"
                className="text-secondary"
              />
              User Registrations
            </h3>
          </CardHeader>
          <CardBody className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.registrations}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="users"
                  name="New Users"
                  fill="#00C49F"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
