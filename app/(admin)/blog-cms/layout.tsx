import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog CMS",
};

export default function BlogCMSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
