"use client";

import React, { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
// import { Header } from "../header";
// import { Breadcrumb } from "../breadcrumb";
import { Header } from "./header";
import { BreadcrumbsNav as Breadcrumbs } from "@/components/breadcrumb";

interface AppLayoutProps {
  children: ReactNode;
}

import { usePathname } from "next/navigation";

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    return [
      { label: "Home", href: "/" },
      ...paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const label =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        return {
          label,
          href,
          isCurrent: index === paths.length - 1,
        };
      }),
    ];
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-80"}
        `}
      >
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isCollapsed={sidebarCollapsed}
        />

        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-800">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
