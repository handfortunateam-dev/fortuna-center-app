import { ReactNode } from "react";

interface RegisterLayoutProps {
  children: ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
