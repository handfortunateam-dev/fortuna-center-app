"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AuthButtonsClient from "./AuthButtonsClient";

export default function AuthButtons() {
  const { user, isSignedIn } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user role from the database
    if (isSignedIn && user?.id) {
      const fetchUserRole = async () => {
        try {
          const response = await fetch("/api/user/role");
          const data = await response.json();
          setUserRole(data.role || "VISITOR");
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setUserRole("VISITOR");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserRole();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id]);

  const isVisitor = userRole === "VISITOR";

  if (isLoading) {
    return null; // Or a loading skeleton
  }

  // If user is logged in and NOT a visitor, show dashboard button
  if (isSignedIn && !isVisitor) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <AuthButtonsClient showDashboard={true} />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    );
  }

  // If user is logged in but IS a visitor, show only user button
  if (isSignedIn && isVisitor) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    );
  }

  // If not logged in, show login/signup buttons
  return <AuthButtonsClient showDashboard={false} />;
}
