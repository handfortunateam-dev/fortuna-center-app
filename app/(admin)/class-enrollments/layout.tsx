import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Enrollments",
};

export default function ClassEnrollmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
