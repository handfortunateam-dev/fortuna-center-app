import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classes",
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
