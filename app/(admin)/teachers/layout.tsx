import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teachers",
};

export default function TeachersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
