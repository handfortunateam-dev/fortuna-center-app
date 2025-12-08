"use client";

import { useEffect, useState, ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const [isDark, setIsDark] = useState<boolean | null>(() => {
    // Initialize state without calling setState in effect
    if (typeof document === "undefined") return null;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const htmlElement = document.documentElement;

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

  // If theme hasn't loaded yet, use a default based on system preference
  const themeToUse = isDark === null
    ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? dark : "simple")
    : (isDark ? dark : "simple");

  return (
    <ClerkProvider
      appearance={{
        theme: themeToUse,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
