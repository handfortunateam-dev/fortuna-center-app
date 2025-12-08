"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

function formatDate(d: Date, locale = "en-US") {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(d: Date, locale = "en-US") {
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12)
    return { text: "Good Morning", icon: "solar:sun-fog-bold-duotone" };
  if (hour >= 12 && hour < 17)
    return { text: "Good Afternoon", icon: "solar:sun-bold-duotone" };
  if (hour >= 17 && hour < 21)
    return { text: "Good Evening", icon: "solar:sunset-bold-duotone" };
  return { text: "Good Night", icon: "solar:moon-stars-bold-duotone" };
}

export default function HeaderDateTimeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  // Realtime tick
  // Realtime tick
  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime(); // Initial client-side render
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = useMemo(() => (now ? formatDate(now) : ""), [now]);
  const timeStr = useMemo(() => (now ? formatTime(now) : ""), [now]);
  const greeting = useMemo(
    () =>
      now
        ? getGreeting(now.getHours())
        : { text: "Hello", icon: "solar:sun-smile-bold-duotone" },
    [now]
  );

  if (!now) return null; // Avoid hydration mismatch

  return (
    <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 group">
      {/* Greeting Bubble */}
      <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-gray-200 dark:border-gray-700">
        <Icon icon={greeting.icon} className="text-xl text-amber-500" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {greeting.text}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Icon
            icon="solar:calendar-bold-duotone"
            className="text-lg text-blue-500"
          />
          <span className="text-sm font-medium hidden sm:inline">
            {dateStr}
          </span>
        </div>

        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block" />

        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Icon
            icon="solar:clock-circle-bold-duotone"
            className="text-lg text-blue-600"
          />
          <span className="text-sm font-bold tabular-nums tracking-wide">
            {timeStr}
          </span>
        </div>
      </div>
    </div>
  );
}
