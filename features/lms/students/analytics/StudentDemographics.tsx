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
import {
  EDUCATION_LEVELS,
  OCCUPATION_TYPES,
} from "@/features/lms/students/constants";
import { AnalyticsData } from "./types";
import { COLORS, CARD_CLASS, CustomTooltip } from "./constants";

const validEducation = new Set(EDUCATION_LEVELS.map((e) => e.value));
const validOccupation = new Set(OCCUPATION_TYPES.map((o) => o.value));

interface StudentDemographicsProps {
  data: AnalyticsData;
  onExportChart: (chartId: string, name: string) => void;
  onBarClick: (
    field: "education" | "occupation" | "ages",
    value: string,
  ) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StudentDemographics({
  data,
  onExportChart,
  onBarClick,
}: StudentDemographicsProps) {
  const processedPlaceOfBirth = (() => {
    let othersCount = 0;
    const filtered = [];
    for (const p of data.students.placeOfBirth) {
      if (p.value === 1 && p.name !== "Unknown/Missing") {
        othersCount++;
      } else {
        filtered.push(p);
      }
    }
    if (othersCount > 0) {
      filtered.push({ name: "Others", value: othersCount });
      return filtered.sort((a, b) => {
        if (a.name === "Unknown/Missing") return 1;
        if (b.name === "Unknown/Missing") return -1;
        if (a.name === "Others") return 1;
        if (b.name === "Others") return -1;
        return b.value - a.value;
      });
    }
    return data.students.placeOfBirth;
  })();

  return (
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
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
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
                    onExportChart(
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
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6B7280",
                  }}
                  formatter={(value) => String(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Education */}
        <Card className="col-span-1 lg:col-span-2 !bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-500 backdrop-blur-xl group relative">
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
            <h4 className="text-md font-bold flex items-center gap-2">
              <Icon
                icon="solar:diploma-bold-duotone"
                className="text-emerald-500"
              />
              Education Levels (Dirty Data Highlighted)
            </h4>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    onExportChart(
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
          <CardBody className="p-0 h-[500px]" id="chart-student-edu">
            <div className="w-full h-full overflow-y-auto p-6 custom-scrollbar block">
              <div
                style={{
                  height: Math.max(450, data.students.education.length * 100),
                  width: "100%",
                }}
              >
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
                      width={220}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Students"
                      radius={[0, 6, 6, 0]}
                      barSize={80}
                      animationDuration={1200}
                    >
                      {data.students.education.map((entry, index) => {
                        const isDirty =
                          !validEducation.has(entry.name) ||
                          entry.name === "Unknown/Missing";
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isDirty ? "#EF4444" : "#10B981"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onBarClick("education", entry.name)}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Occupation */}
        <Card className="col-span-1 lg:col-span-2 !bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-500 backdrop-blur-xl group relative">
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
            <h4 className="text-md font-bold flex items-center gap-2">
              <Icon icon="solar:case-bold-duotone" className="text-amber-500" />
              Occupations (Dirty Data Highlighted)
            </h4>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    onExportChart("chart-student-occ", "Student Occupations")
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
          <CardBody className="p-0 h-[500px]" id="chart-student-occ">
            <div className="w-full h-full overflow-y-auto p-6 custom-scrollbar block">
              <div
                style={{
                  height: Math.max(450, data.students.occupation.length * 100),
                  width: "100%",
                }}
              >
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
                      width={220}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Students"
                      radius={[0, 6, 6, 0]}
                      barSize={80}
                      animationDuration={1400}
                    >
                      {data.students.occupation.map((entry, index) => {
                        const isDirty =
                          !validOccupation.has(entry.name) ||
                          entry.name === "Unknown/Missing";
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isDirty ? "#EF4444" : "#F59E0B"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onBarClick("occupation", entry.name)}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Age Distribution */}
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
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
                    onExportChart(
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
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  animationDuration={1600}
                >
                  {data.students.ages.map((entry, index) => {
                    const isDirty = entry.name === "Unknown/Missing";
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isDirty ? "#EF4444" : "#8B5CF6"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onBarClick("ages", entry.name)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Status Distribution */}
        <Card className={CARD_CLASS}>
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
            <h4 className="text-md font-bold flex items-center gap-2">
              <Icon
                icon="solar:shield-user-bold-duotone"
                className="text-danger"
              />
              Status Distribution
            </h4>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    onExportChart(
                      "chart-student-status",
                      "Student Status Distribution",
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
          <CardBody className="p-6 h-[350px]" id="chart-student-status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.students.status}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1800}
                >
                  {data.students.status.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#10B981", // active - green
                          "#EF4444", // inactive - red
                          "#F59E0B", // on_leave - orange
                        ][index % 3]
                      }
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6B7280",
                  }}
                  formatter={(value) => String(value).replace("_", " ")}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Place of Birth */}
        <Card className="col-span-1 lg:col-span-2 !bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-500 backdrop-blur-xl group relative">
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h4 className="text-md font-bold flex items-center gap-2">
                <Icon
                  icon="solar:map-point-bold-duotone"
                  className="text-violet-500"
                />
                Place of Birth Distribution
              </h4>
              <p className="text-xs text-default-400 ml-7">
                {
                  data.students.placeOfBirth.filter(
                    (p) => p.name !== "Unknown/Missing",
                  ).length
                }{" "}
                unique locations ·{" "}
                <span className="text-danger font-semibold">
                  {data.students.placeOfBirth.find(
                    (p) => p.name === "Unknown/Missing",
                  )?.value ?? 0}{" "}
                  unknown / missing
                </span>
              </p>
            </div>
            <div className="print:hidden">
              <HeroTooltip content="Download PNG">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    onExportChart(
                      "chart-student-birth",
                      "Student Place of Birth Distribution",
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
          <CardBody className="p-0 h-[500px]" id="chart-student-birth">
            <div className="w-full h-full overflow-y-auto p-6 custom-scrollbar block">
              <div
                style={{
                  height: Math.max(400, processedPlaceOfBirth.length * 48),
                  width: "100%",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={processedPlaceOfBirth}
                    margin={{ left: 20, right: 80 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={180}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Students"
                      radius={[0, 6, 6, 0]}
                      barSize={34}
                      label={{
                        position: "right",
                        fontSize: 11,
                        fill: "#6B7280",
                        fontWeight: 600,
                      }}
                      animationDuration={1300}
                    >
                      {processedPlaceOfBirth.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Unknown/Missing"
                              ? "#EF4444"
                              : entry.name === "Others"
                                ? "#10B981"
                                : "#6366f1"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </section>
  );
}
