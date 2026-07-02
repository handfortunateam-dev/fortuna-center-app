"use client";

import React, { useEffect, useState } from "react";
import { useScheduler } from "../context/SchedulerContext";
import { format } from "date-fns";

interface ScrollNavigatorProps {
  days: Date[];
}

export function ScrollNavigator({ days }: ScrollNavigatorProps) {
  const { isWideMode, scrollContainer } = useScheduler();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScroll = scrollWidth - clientWidth;

      setVisibleWidth(clientWidth);
      setContentWidth(scrollWidth);

      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll);
      } else {
        setScrollProgress(0);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      // Re-check dimensions whenever container or window resizes
      handleScroll();
    });
    resizeObserver.observe(scrollContainer);

    // Also observe the FIRST CHILD because that's what actually grows/shrinks content
    if (scrollContainer.firstElementChild) {
      resizeObserver.observe(scrollContainer.firstElementChild);
    }

    scrollContainer.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    // Force periodic checks for 1 second after mode change to catch layout shifts
    const interval = setInterval(handleScroll, 100);
    const timeout = setTimeout(() => clearInterval(interval), 1000);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [scrollContainer, isWideMode, days]);

  // Only show if in wide mode AND there's actual scrollable content
  const hasScroll = contentWidth > visibleWidth + 10; // +10 for buffer
  if (!isWideMode || !hasScroll) return null;

  // Mini map logic
  const handleItemClick = (index: number) => {
    if (!scrollContainer) return;

    const { scrollWidth } = scrollContainer;
    const targetScroll = (scrollWidth / days.length) * index;

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-primary/20 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 pointer-events-auto">
        {days.map((date, idx) => {
          const isCurrent =
            Math.round(scrollProgress * (days.length - 1)) === idx;

          return (
            <button
              key={idx}
              onClick={() => handleItemClick(idx)}
              className={`
                flex flex-col items-center justify-center w-10 h-12 rounded-xl transition-all
                ${
                  isCurrent
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                }
              `}
              title={format(date, "EEEE, MMMM d")}
            >
              <span className="text-[10px] font-bold uppercase leading-none mb-0.5">
                {format(date, "EEE")}
              </span>
              <span className="text-xs font-black">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
