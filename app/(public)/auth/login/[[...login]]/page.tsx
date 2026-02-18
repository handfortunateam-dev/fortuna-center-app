"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import LocalSignIn from "@/components/auth/LocalSignIn";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";
import { usePublicConfig } from "@/hooks/use-public-config";

export default function SignInCatchAll() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const { data: config, isLoading } = usePublicConfig();

  const authProvider = config?.auth_provider || "clerk";

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark
          ? "bg-linear-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gray-50"
      }`}
    >
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
              signUpUrl="/auth/signup"
              afterSignInUrl="/dashboard"
            />
          ) : (
            <LocalSignIn />
          )}
        </div>
      )}
    </div>
  );
}
