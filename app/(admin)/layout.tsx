"use client";

import React, { ReactNode, useState } from "react";
import { Navbar, Sidebar } from "@/components/layout";
import { BreadcrumbsNav } from "@/components/breadcrumb";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        {/* Navbar */}
        <Navbar
          mode="dashboard"
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-800">
          <BreadcrumbsNav autoFromPath={true} />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
