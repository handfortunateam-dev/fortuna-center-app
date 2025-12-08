"use client";
import { motion, type Transition } from "framer-motion";
import { type ReactNode } from "react";

interface ListItemMotionProps {
  children: ReactNode;
  index: number;
  baseDelay?: number;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
  transition?: Transition;
}

export default function ListItemMotion({
  children,
  index,
  baseDelay = 0,
  staggerDelay = 0.1,
  direction = "right",
  distance = 20,
  className = "",
  transition,
}: ListItemMotionProps) {
  // Calculate total delay based on index
  const totalDelay = baseDelay + index * staggerDelay;

  const defaultTransition: Transition = {
    delay: totalDelay,
    duration: 0.3,
    ease: "easeOut",
  };

  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      default:
        return { opacity: 0, x: -distance };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={transition || defaultTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
