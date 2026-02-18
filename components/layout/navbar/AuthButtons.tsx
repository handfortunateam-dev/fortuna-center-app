"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AuthButtonsClient from "./AuthButtonsClient";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import { useGetIdentity } from "@/hooks/useGetIdentity";
import LocalUserMenu from "./LocalUserMenu";

export default function AuthButtons() {
  const { authProvider } = useAuthProvider();

  // Clerk hooks
  const {
    user: clerkUser,
    isSignedIn: isClerkSignedIn,
    isLoaded: isClerkLoaded,
  } = useUser();

  // Local hooks
  const { user: localUser, loading: localLoading } = useGetIdentity();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authProvider === "clerk") {
      if (!isClerkLoaded) return;

      // Clerk logic
      if (isClerkSignedIn && clerkUser?.id) {
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
    } else {
      // Local logic
      if (!localLoading) {
        if (localUser) {
          setUserRole(localUser.role || "VISITOR");
        }
        setIsLoading(false);
      }
    }
  }, [
    authProvider,
    isClerkSignedIn,
    clerkUser?.id,
    localLoading,
    localUser,
    isClerkLoaded,
  ]);

  // Determine if signed in, visitor status and effective user role
  const isSignedIn = authProvider === "clerk" ? !!isClerkSignedIn : !!localUser;
  const isVisitor = userRole === "VISITOR";

  if (isLoading) {
    return null; // Or a loading skeleton
  }

  // If user is logged in and NOT a visitor, show dashboard button
  if (isSignedIn && !isVisitor) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <AuthButtonsClient showDashboard={true} />
        {authProvider === "clerk" ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        ) : (
          <LocalUserMenu />
        )}
      </div>
    );
  }

  // If user is logged in but IS a visitor, show only user button
  if (isSignedIn && isVisitor) {
    return (
      <div className="hidden md:flex items-center gap-2">
        {authProvider === "clerk" ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        ) : (
          <LocalUserMenu />
        )}
      </div>
    );
  }

  // If not logged in, show login/signup buttons
  return <AuthButtonsClient showDashboard={false} />;
}
