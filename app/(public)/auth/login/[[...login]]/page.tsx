"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInCatchAll() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Listen for theme changes and update state when the class list changes
    const observer = new MutationObserver(() => {
      const isDarkMode = htmlElement.classList.contains("dark");
      setIsDark(isDarkMode);
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-linear-to-br from-gray-950 via-gray-900 to-gray-950" : ""
      }`}
    >
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/auth/login"
          signUpUrl="/auth/signup"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
