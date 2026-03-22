import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Scheduler",
};

export default function ClassSchedulerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
