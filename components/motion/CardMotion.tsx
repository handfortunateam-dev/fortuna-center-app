"use client";
import { motion, type Transition } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  transition?: Transition;
}

export default function CardMotion({
  children,
  delay = 0,
  className = "glass-panel rounded-2xl p-6 border border-default-200",
  direction = "up",
  distance = 20,
  transition,
}: AnimatedCardProps) {
  const defaultTransition: Transition = {
    delay,
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
        return { opacity: 0, y: distance };
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
