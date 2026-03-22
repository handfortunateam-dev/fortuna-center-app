import type { Metadata } from "next";
import DashboardGrid from "@/features/dashboard/DashboardGrid";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardGrid />;
}
