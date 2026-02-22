"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Tooltip as HeroTooltip,
} from "@heroui/react";
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
  AreaChart,
  Area,
} from "recharts";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { Heading } from "@/components/heading";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

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

interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-divider p-3 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <p className="text-sm font-bold text-default-900">
              {entry.name}: {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsUsersPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleExportChart = (chartId: string, name: string) => {
    const chartContainer = document.getElementById(chartId);
    if (!chartContainer) return;

    const svg = chartContainer.querySelector("svg");
    if (!svg) return;

    // Create a copy of the SVG to modify if needed
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const svgSize = svg.getBoundingClientRect();
    const padding = 20;

    canvas.width = svgSize.width + padding * 2;
    canvas.height = svgSize.height + padding * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, padding, padding);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${name.toLowerCase().replace(/\s+/g, "_")}_chart.png`;
      link.href = url;
      link.click();
    };

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  const handlePrint = () => {
    window.print();
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-48 h-10 rounded-xl" />
          <Skeleton className="w-64 h-4 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 border-divider shadow-2xl backdrop-blur-xl bg-background/60">
          <div className="flex flex-col items-center gap-4">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="text-danger text-6xl"
            />
            <p className="text-default-500 font-medium">
              Failed to load analytics data
            </p>
          </div>
        </Card>
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Heading title="Users Analytics">Analytics Overview</Heading>
          <p className="text-default-500 text-sm md:text-base max-w-2xl">
            Real-time insights into user demographics, registrations, and
            behavioral trends across students and teachers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-default-100 dark:bg-default-50 px-4 py-2 rounded-2xl text-xs font-semibold text-default-600 border border-divider">
            <Icon
              icon="solar:calendar-bold-duotone"
              className="text-primary text-lg"
            />
            Last 6 Months
          </div>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant="flat"
                color="primary"
                startContent={
                  <Icon
                    icon="solar:download-square-bold-duotone"
                    className="text-xl"
                  />
                }
                className="rounded-2xl font-bold"
              >
                Export
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Export Options">
              <DropdownItem
                key="pdf"
                startContent={
                  <Icon
                    icon="solar:file-text-bold-duotone"
                    className="text-danger"
                  />
                }
                description="Save entire dashboard as PDF"
                onPress={handlePrint}
              >
                Download PDF Report
              </DropdownItem>
              <DropdownItem
                key="png"
                startContent={
                  <Icon
                    icon="solar:gallery-bold-duotone"
                    className="text-success"
                  />
                }
                description="Save charts manually using the icons below"
                isDisabled
              >
                Save as Images (PNG)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          title="Total Users"
          value={data.summary.totalUsers}
          change="+12%"
          icon="solar:users-group-rounded-bold-duotone"
          bgColor="bg-blue-500/10"
          textColor="text-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Active Students"
          value={data.summary.totalStudents}
          change="+18%"
          icon="solar:user-id-bold-duotone"
          bgColor="bg-emerald-500/10"
          textColor="text-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Verified Teachers"
          value={data.summary.totalTeachers}
          change="+5%"
          icon="solar:user-speak-bold-duotone"
          bgColor="bg-amber-500/10"
          textColor="text-amber-500"
          delay={0.3}
        />
      </motion.div>

      {/* Main Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
          <CardHeader className="p-6 flex flex-row items-center justify-between gap-1">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon
                    icon="solar:pie-chart-2-bold-duotone"
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="text-xl font-bold">Platform Distribution</h3>
              </div>
              <p className="text-xs text-default-400 ml-11">
                Breakdown of system users by their assigned roles
              </p>
            </div>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    handleExportChart("chart-platform", "Platform Distribution")
                  }
                >
                  <Icon
                    icon="solar:download-bold-duotone"
                    className="text-default-400 text-lg"
                  />
                </Button>
              </HeroTooltip>
            </div>
          </CardHeader>
          <CardBody className="p-6 h-[400px]" id="chart-platform">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="role"
                  stroke="none"
                  animationBegin={200}
                >
                  {data.usersByRole.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm font-medium capitalize text-default-600">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
          <CardHeader className="p-6 flex flex-row items-center justify-between gap-1">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon
                    icon="solar:graph-new-up-bold-duotone"
                    className="text-secondary text-2xl"
                  />
                </div>
                <h3 className="text-xl font-bold">Growth Trends</h3>
              </div>
              <p className="text-xs text-default-400 ml-11">
                Monthly registration volume for new students
              </p>
            </div>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    handleExportChart("chart-growth", "Student Growth Trends")
                  }
                >
                  <Icon
                    icon="solar:download-bold-duotone"
                    className="text-default-400 text-lg"
                  />
                </Button>
              </HeroTooltip>
            </div>
          </CardHeader>
          <CardBody className="p-6 h-[400px]" id="chart-growth">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.registrations}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "gray" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "gray" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Registrations"
                  stroke="#10B981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>

      {/* Student Demographics */}
      <section className="space-y-8">
        <header className="flex flex-col gap-1 border-l-4 border-success pl-4 ml-1">
          <h2 className="text-2xl font-bold text-default-900 flex items-center gap-3">
            Student Demographics
          </h2>
          <p className="text-default-500 text-sm">
            Detailed insights based on {data.summary.totalStudents} registered
            students • Average Age:{" "}
            <span className="font-bold text-success">
              {data.students.avgAge.toFixed(1)}
            </span>
          </p>
        </header>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Gender */}
          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="text-md font-bold flex items-center gap-2">
                <Icon icon="solar:user-bold-duotone" className="text-primary" />
                Gender Split
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-student-gender",
                        "Student Gender Split",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-6 h-[350px]" id="chart-student-gender">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.students.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {data.students.gender.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm font-semibold capitalize text-default-600">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Education */}
          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="text-md font-bold flex items-center gap-2">
                <Icon
                  icon="solar:diploma-bold-duotone"
                  className="text-emerald-500"
                />
                Education Levels
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-student-edu",
                        "Student Education Levels",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-6 h-[350px]" id="chart-student-edu">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.students.education}
                  margin={{ left: 20, right: 30 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Students"
                    fill="#10B981"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Occupation */}
          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="text-md font-bold flex items-center gap-2">
                <Icon
                  icon="solar:case-bold-duotone"
                  className="text-amber-500"
                />
                Occupations
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-student-occ",
                        "Student Occupations",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-6 h-[350px]" id="chart-student-occ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.students.occupation}
                  margin={{ left: 20, right: 30 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Students"
                    fill="#F59E0B"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                    animationDuration={1400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Age Distribution */}
          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="text-md font-bold flex items-center gap-2">
                <Icon
                  icon="solar:user-bold-duotone"
                  className="text-purple-500"
                />
                Age Distribution
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-student-age",
                        "Student Age Distribution",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-6 h-[350px]" id="chart-student-age">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.students.ages} margin={{ bottom: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="StudentsCount"
                    fill="#8B5CF6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                    animationDuration={1600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </section>

      {/* Teacher Demographics */}
      <section className="space-y-8">
        <header className="flex flex-col gap-1 border-l-4 border-warning pl-4 ml-1">
          <h2 className="text-2xl font-bold text-default-900 flex items-center gap-3">
            Teacher Demographics
          </h2>
          <p className="text-default-500 text-sm">
            Insightful breakdown of {data.summary.totalTeachers} verified
            teachers • Average Age:{" "}
            <span className="font-bold text-warning">
              {data.teachers.avgAge.toFixed(1)}
            </span>
          </p>
        </header>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                Gender Balance
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-teacher-gender",
                        "Teacher Gender Support",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-4 h-[300px]" id="chart-teacher-gender">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.teachers.gender}
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {data.teachers.gender.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 2) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                Educational Background
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-teacher-edu",
                        "Teacher Education Background",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-4 h-[300px]" id="chart-teacher-edu">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.teachers.education}
                  margin={{ left: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="border-divider shadow-sm hover:shadow-xl transition-all duration-500 bg-background/60 backdrop-blur-xl group relative">
            <CardHeader className="px-6 py-4 border-b border-divider/50 flex flex-row items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                Experience by Age
              </h4>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      handleExportChart(
                        "chart-teacher-age",
                        "Teacher Age Distribution",
                      )
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </CardHeader>
            <CardBody className="p-4 h-[300px]" id="chart-teacher-age">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.teachers.ages}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </section>
    </motion.div>
  );
}
