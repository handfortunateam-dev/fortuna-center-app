"use client";

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import LocalSignUp from "@/components/auth/LocalSignUp";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";
import { usePublicConfig } from "@/hooks/use-public-config";

export default function SignUpCatchAll() {
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
      <div className="w-full max-w-md">
        {isLoading ? (
          <AuthPageSkeleton />
        ) : authProvider === "clerk" ? (
          <SignUp
            routing="path"
            path="/auth/signup"
            signInUrl="/auth/login"
            afterSignUpUrl="/dashboard"
          />
        ) : (
          <LocalSignUp />
        )}
      </div>
    </div>
  );
}
