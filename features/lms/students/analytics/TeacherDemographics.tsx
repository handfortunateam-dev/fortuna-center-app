"use client";

import {
  Card,
  CardBody,
  CardHeader,
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
} from "recharts";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { AnalyticsData } from "./types";
import { COLORS, CARD_CLASS, CustomTooltip } from "./constants";

interface TeacherDemographicsProps {
  data: AnalyticsData;
  onExportChart: (chartId: string, name: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TeacherDemographics({
  data,
  onExportChart,
}: TeacherDemographicsProps) {
  return (
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
        {/* Gender Balance */}
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
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
                    onExportChart(
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

        {/* Educational Background */}
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
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
                    onExportChart(
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

        {/* Experience by Age */}
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
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
                    onExportChart(
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
  );
}
