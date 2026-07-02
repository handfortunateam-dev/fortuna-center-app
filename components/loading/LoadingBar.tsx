"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activate = setTimeout(() => setLoading(true), 0);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => {
      clearTimeout(activate);
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-500 animate-loading-bar" />
    </div>
  );
}
