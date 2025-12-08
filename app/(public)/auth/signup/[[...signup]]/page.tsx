"use client";

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpCatchAll() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    // Check if dark mode is enabled
    const htmlElement = document.documentElement;
    // const isDarkMode = htmlElement.classList.contains("dark");
    // setIsDark(isDarkMode);

    // Listen for theme changes
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
        <SignUp
          routing="path"
          path="/auth/signup"
          signInUrl="/auth/login"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
