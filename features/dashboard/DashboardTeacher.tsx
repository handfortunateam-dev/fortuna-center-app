"use client";

import { Icon } from "@iconify/react";
import { AuthUser } from "@/lib/auth/getAuthUser";

interface DashboardTeacherProps {
  user: AuthUser | null;
}

export default function DashboardTeacher({ user }: DashboardTeacherProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Teacher Dashboard</h1>
          <p className="text-default-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! Manage your classes and students.
          </p>
        </div>
        <div className="glass-panel px-4 py-3 rounded-xl border border-default-200">
          <div className="flex items-center gap-2 text-default-500">
            <Icon icon="solar:user-bold-duotone" className="text-xl" />
            <span className="text-sm font-medium">Teacher</span>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="glass-panel rounded-2xl p-8 border border-default-200 text-center">
        <Icon
          icon="solar:book-2-bold-duotone"
          className="text-6xl text-primary mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-default-900 mb-2">
          Teacher Dashboard
        </h2>
        <p className="text-default-500">
          This is a placeholder for the teacher dashboard. You can customize this view
          to show classes, assignments, and student progress.
        </p>
      </div>
    </div>
  );
}
