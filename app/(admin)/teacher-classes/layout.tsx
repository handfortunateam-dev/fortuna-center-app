import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Classes",
};

export default function TeacherClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
