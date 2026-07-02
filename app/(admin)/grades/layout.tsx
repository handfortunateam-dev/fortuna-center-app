import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Management",
};

export default function GradesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
