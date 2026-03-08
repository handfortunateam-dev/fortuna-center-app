"use client";

import { SignIn } from "@clerk/nextjs";
import LocalSignIn from "@/components/auth/LocalSignIn";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";
import { usePublicConfig } from "@/hooks/use-public-config";

export default function SignInCatchAll() {
  const { data: config, isLoading } = usePublicConfig();

  const authProvider = config?.auth_provider || "clerk";

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-gray-50 dark:bg-linear-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {isLoading ? (
        <div className="w-full max-w-md">
          <AuthPageSkeleton />
        </div>
      ) : (
        <div className="w-full max-w-md">
          {authProvider === "clerk" ? (
            <SignIn
              routing="path"
              path="/auth/login"
              afterSignInUrl="/dashboard"
              appearance={{
                elements: {
                  footerAction: { display: "none" },
                },
              }}
            />
          ) : (
            <LocalSignIn />
          )}
        </div>
      )}
    </div>
  );
}
