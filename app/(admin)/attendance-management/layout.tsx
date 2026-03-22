import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Management",
};

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
