import StatCard from "@/components/ui/StatCard";
import React, { useMemo } from "react";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { Heading } from "@/components/heading";
import { Badge, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { getMonth, getYear } from "date-fns";
import { ClassSummary } from "@/features/finance/payment-history/types";

export default function StatisticGeneral({
  view = "all",
}: {
  view?: "all" | "lms" | "finance" | "personnel";
}) {
  const { lms, personnel } = useDashboardStats();

  // Fetch Payment Summary for the current month
  const currentMonth = String(getMonth(new Date()) + 1);
  const currentYear = String(getYear(new Date()));

  const { data: paymentSummary, isLoading: paymentLoading } = useQuery({
    queryKey: ["dashboard-payment-summary", currentMonth, currentYear],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: ClassSummary[];
      }>("/course-payments/summary", {
        params: {
          month: currentMonth,
          year: currentYear,
        },
      });
      return res.data.data;
    },
    enabled: view === "all" || view === "finance",
  });

  // Aggregate Paid and Unpaid counts
  const paymentStats = useMemo(() => {
    if (!paymentSummary) return { paid: 0, unpaid: 0 };

    let paid = 0;
    let unpaid = 0;

    paymentSummary.forEach((classItem) => {
      classItem.students.forEach((student) => {
        if (student.payment?.status === "paid") {
          paid++;
        } else {
          unpaid++;
        }
      });
    });

    return { paid, unpaid };
  }, [paymentSummary]);

  return (
    <div className="space-y-8">
      {/* Finance Overview Section */}
      {(view === "all" || view === "finance") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heading as="h3" size="lg" className="font-bold text-default-800">
              Finance Overview
            </Heading>
            <Badge color="success" variant="flat" size="sm">
              Current Month Payments
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Students Already Paid"
              value={
                paymentLoading ? (
                  <Spinner size="sm" />
                ) : (
                  paymentStats.paid.toLocaleString()
                )
              }
              change="Current month"
              icon="solar:check-circle-bold"
              bgColor="bg-green-500/10"
              textColor="text-green-600"
              delay={0.1}
              url="/payment-course-history"
            />
            <StatCard
              title="Students Not Yet Paid"
              value={
                paymentLoading ? (
                  <Spinner size="sm" />
                ) : (
                  paymentStats.unpaid.toLocaleString()
                )
              }
              change="Action required"
              icon="solar:danger-circle-bold"
              bgColor="bg-red-500/10"
              textColor="text-red-600"
              delay={0.2}
              url="/payment-course-history"
            />
          </div>
        </section>
      )}

      {/* LMS Section */}
      {(view === "all" || view === "lms") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heading as="h3" size="lg" className="font-bold text-default-800">
              LMS Overview
            </Heading>
            <Badge color="primary" variant="flat" size="sm">
              Learning Management
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Students"
              value={
                lms.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  lms.totalStudents.toLocaleString()
                )
              }
              change="+12% from last month"
              icon="solar:users-group-rounded-bold"
              bgColor="bg-blue-500/10"
              textColor="text-blue-600"
              delay={0.3}
              url="/students"
            />
            <StatCard
              title="Total Classes"
              value={
                lms.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  lms.totalClasses.toString()
                )
              }
              change="Active programs"
              icon="solar:book-bookmark-bold"
              bgColor="bg-blue-600/10"
              textColor="text-blue-700"
              delay={0.4}
              url="/classes"
            />
            <StatCard
              title="Active Sessions"
              value={
                lms.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  lms.activeClasses.toString()
                )
              }
              change={
                lms.activeClasses > 0 ? "ongoing right now" : "No live classes"
              }
              icon="solar:play-circle-bold"
              bgColor="bg-blue-700/10"
              textColor="text-blue-800"
              delay={0.5}
            />
          </div>
        </section>
      )}

      {/* Personnel & Logistics Section */}
      {(view === "all" || view === "personnel") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Heading as="h3" size="lg" className="font-bold text-default-800">
              Personnel & Logistics
            </Heading>
            <Badge color="secondary" variant="flat" size="sm">
              Staffing
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Teachers"
              value={
                personnel.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  personnel.totalTeachers.toLocaleString()
                )
              }
              change="Registered educators"
              icon="solar:user-id-bold"
              bgColor="bg-purple-500/10"
              textColor="text-purple-600"
              delay={0.6}
              url="/teachers"
            />
            <StatCard
              title="Total Users Accounts"
              value={
                personnel.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  personnel.totalUsers.toLocaleString()
                )
              }
              change="All system accounts"
              icon="solar:users-group-two-rounded-bold"
              bgColor="bg-purple-600/10"
              textColor="text-purple-700"
              delay={0.7}
              url="/users"
            />
            <StatCard
              title="Active Schedules"
              value={
                personnel.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  personnel.totalSchedules.toLocaleString()
                )
              }
              change="Class routines set"
              icon="solar:calendar-date-bold"
              bgColor="bg-purple-700/10"
              textColor="text-purple-800"
              delay={0.8}
              url="/class-scheduler-management"
            />
            <StatCard
              title="Pending Registrations"
              value={
                personnel.isLoading ? (
                  <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                    size="sm"
                  />
                ) : (
                  personnel.pendingRegistrations.toLocaleString()
                )
              }
              change="New signups waiting"
              icon="solar:clipboard-list-bold-duotone"
              bgColor="bg-indigo-500/10"
              textColor="text-indigo-600"
              delay={0.9}
              url="/registrations"
            />
          </div>
        </section>
      )}
    </div>
  );
}
