"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page when route changes
 * Prevents scroll position carrying over to new pages
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "smooth" for smooth scroll animation
    });
  }, [pathname]);

  // This component renders nothing
  return null;
}
