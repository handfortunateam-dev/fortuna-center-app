"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tooltip as HeroTooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { AnalyticsData } from "./types";
import { COLORS, CARD_CLASS, CustomTooltip } from "./constants";

type GrowthPeriod = "month" | "quarter" | "year";

interface OverviewSectionProps {
  data: AnalyticsData;
  onExportChart: (chartId: string, name: string) => void;
  onPrint: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PERIOD_LABELS: Record<GrowthPeriod, string> = {
  month: "Monthly",
  quarter: "Quarterly",
  year: "Yearly",
};

const PERIOD_SUBTITLES: Record<GrowthPeriod, string> = {
  month: "Monthly registration volume for new students",
  quarter: "Quarterly registration volume for new students",
  year: "Year-by-year registration volume for new students",
};

export function OverviewSection({
  data,
  onExportChart,
  onPrint,
}: OverviewSectionProps) {
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>("year");

  const growthData =
    growthPeriod === "year"
      ? data.registrationsByYear
      : growthPeriod === "quarter"
        ? data.registrationsByQuarter
        : data.registrations;

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Heading title="Users Analytics">Analytics Overview</Heading>
          <Text className="text-default-500 text-sm md:text-base max-w-2xl">
            Real-time insights into user demographics, registrations, and
            behavioral trends across students and teachers.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-default-100 dark:bg-default-50 px-4 py-2 rounded-2xl text-xs font-semibold text-default-600 border border-gray-200 dark:border-white/10">
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
                onPress={onPrint}
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
        <HeroTooltip
          content={`Out of ${data.summary.totalStudents} total students`}
        >
          <div className="flex-1">
            <StatCard
              title="Active Students"
              value={data.summary.activeStudents}
              change="+18%"
              icon="solar:user-id-bold-duotone"
              bgColor="bg-emerald-500/10"
              textColor="text-emerald-500"
              delay={0.2}
            />
          </div>
        </HeroTooltip>
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

      {/* Platform Distribution + Growth Trends */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className={CARD_CLASS}>
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
                    onExportChart("chart-platform", "Platform Distribution")
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
                  {data.usersByRole.map((_, index) => (
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
                  wrapperStyle={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}
                  formatter={(value) => String(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className={CARD_CLASS}>
          <CardHeader className="p-6 flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between gap-1 w-full">
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
                  {PERIOD_SUBTITLES[growthPeriod]}
                </p>
              </div>
              <div className="print:hidden">
                <HeroTooltip content="Download PNG">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() =>
                      onExportChart("chart-growth", `Student Growth Trends (${PERIOD_LABELS[growthPeriod]})`)
                    }
                  >
                    <Icon
                      icon="solar:download-bold-duotone"
                      className="text-default-400 text-lg"
                    />
                  </Button>
                </HeroTooltip>
              </div>
            </div>
            {/* Period selector */}
            <div className="flex items-center self-start gap-0.5 bg-default-100 dark:bg-default-50/30 rounded-xl p-1 border border-default-200 dark:border-white/10">
              {(["year", "quarter", "month"] as GrowthPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setGrowthPeriod(period)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    growthPeriod === period
                      ? "bg-white dark:bg-default-200 shadow-sm text-foreground"
                      : "text-default-500 hover:text-default-700 dark:hover:text-default-300"
                  }`}
                >
                  {PERIOD_LABELS[period]}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody className="p-6 h-[400px]" id="chart-growth">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
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
    </>
  );
}
