import React from "react";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { UserRole } from "@/enums/common";
import { redirect } from "next/navigation";
import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardTeacher from "./DashboardTeacher";
import DashboardEmployee from "./DashboardEmployee";
import DashboardStudent from "./student/DashboardStudent";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default async function DashboardGrid() {
  // Fetch user data on the server
  const user = await getAuthUser();

  console.log(user, "data dashboard grid");

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Render dashboard based on user role
  switch (user.role) {
    case UserRole.ADMIN:
      return <DashboardAdmin user={user} />;

    case UserRole.TEACHER:
      return <DashboardTeacher user={user} />;

    case UserRole.STUDENT:
      return <DashboardStudent user={user} />;

    case UserRole.ADMINISTRATIVE_EMPLOYEE:
      return <DashboardEmployee user={user} />;

    default:
      // Fallback for unknown roles
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Heading
              as="h2"
              size="xl"
              weight="bold"
              className="text-default-900 mb-2"
            >
              Unknown Role
            </Heading>
            <Text color="default" className="text-default-500">
              Your account role is not recognized. Please contact support.
            </Text>
          </div>
        </div>
      );
  }
}
