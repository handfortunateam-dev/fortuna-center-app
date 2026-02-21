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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

type AnalyticsData = {
  summary: { totalUsers: number; totalStudents: number; totalTeachers: number };
  usersByRole: { role: string; value: number }[];
  registrations: { name: string; users: number }[];
  students: {
    gender: { name: string; value: number }[];
    education: { name: string; value: number }[];
    occupation: { name: string; value: number }[];
    ages: { name: string; value: number }[];
    avgAge: number;
  };
  teachers: {
    gender: { name: string; value: number }[];
    education: { name: string; value: number }[];
    ages: { name: string; value: number }[];
    avgAge: number;
  };
};

export default function AnalyticsUsersPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/users")
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
                <Skeleton className="w-16 h-8 rounded-lg" />
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

        {/* Students Heading */}
        <div className="mt-8 mb-4">
          <Skeleton className="w-1/3 h-8 rounded-md mb-2" />
          <Skeleton className="w-2/3 h-4 rounded-md" />
        </div>

        {/* 4 Student Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm border border-divider">
              <CardHeader className="px-6 py-4 border-b border-divider">
                <Skeleton className="w-1/2 h-5 rounded-md" />
              </CardHeader>
              <CardBody className="p-4 h-[250px]">
                <Skeleton className="w-full h-full rounded-xl" />
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Teachers Heading */}
        <div className="mt-8 mb-4">
          <Skeleton className="w-1/3 h-8 rounded-md mb-2" />
          <Skeleton className="w-2/3 h-4 rounded-md" />
        </div>

        {/* 3 Teacher Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border border-divider">
              <CardHeader className="px-6 py-4 border-b border-divider">
                <Skeleton className="w-1/2 h-5 rounded-md" />
              </CardHeader>
              <CardBody className="p-4 h-[250px]">
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
        Failed to load data
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <Heading title="Users Analytics"> Users Analytics</Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={data.summary.totalUsers}
          change="+0%"
          icon="solar:users-group-rounded-bold-duotone"
          bgColor="bg-primary/20"
          textColor="text-primary"
          delay={0.1}
        />
        <StatCard
          title="Total Students"
          value={data.summary.totalStudents}
          change="+0%"
          icon="solar:user-id-bold-duotone"
          bgColor="bg-success/20"
          textColor="text-success"
          delay={0.2}
        />
        <StatCard
          title="Total Teachers"
          value={data.summary.totalTeachers}
          change="+0%"
          icon="solar:user-speak-bold-duotone"
          bgColor="bg-warning/20"
          textColor="text-warning"
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
                  {data.usersByRole.map(
                    (
                      _entry: { role: string; value: number },
                      index: number,
                    ) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
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
              Student Registrations
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
                  name="New Students"
                  fill="#00C49F"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:user-id-bold-duotone" className="text-success" />
          Students Demographics
        </h2>
        <p className="text-default-500 text-sm mt-1 mb-4">
          Data and insights based on registered students (Avg Age:{" "}
          {data.students.avgAge > 0
            ? `${data.students.avgAge} years old`
            : "Unknown"}
          )
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Gender */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Gender Distribution
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.students.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {data.students.gender.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Student Education */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Education Levels
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.students.education}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Student Occupation */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Occupations
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.students.occupation}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Student Age Distribution */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Age Distribution
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.students.ages}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:user-speak-bold-duotone" className="text-warning" />
          Teachers Demographics
        </h2>
        <p className="text-default-500 text-sm mt-1 mb-4">
          Data and insights based on registered teachers (Avg Age:{" "}
          {data.teachers.avgAge > 0
            ? `${data.teachers.avgAge} years old`
            : "Unknown"}
          )
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teacher Gender */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Gender Distribution
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.teachers.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {data.teachers.gender.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 1) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Teacher Education */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Education Levels
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.teachers.education}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Teacher Age Distribution */}
        <Card className="shadow-sm border border-divider">
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h3 className="text-md font-semibold text-default-700">
              Age Distribution
            </h3>
          </CardHeader>
          <CardBody className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.teachers.ages}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#82ca9d"
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
