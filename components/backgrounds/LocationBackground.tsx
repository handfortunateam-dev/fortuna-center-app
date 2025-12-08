"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LocationBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Map Contours (Abstract) */}
      <svg
        className="absolute w-full h-full opacity-[0.1] text-primary fill-none stroke-current"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 20 Q 20 5, 40 20 T 80 20 T 100 20" strokeWidth="0.5" />
        <path d="M0 40 Q 20 25, 40 40 T 80 40 T 100 40" strokeWidth="0.5" />
        <path d="M0 60 Q 20 45, 40 60 T 80 60 T 100 60" strokeWidth="0.5" />
        <path d="M0 80 Q 20 65, 40 80 T 80 80 T 100 80" strokeWidth="0.5" />
      </svg>

      {/* Location Pin Shadows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 0.08, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-10 right-10 text-primary"
      >
        <svg viewBox="0 0 24 24" className="w-32 h-32 fill-current">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute top-[30%] left-[10%] w-2 h-2 bg-primary/10 rounded-full animate-pulse" />
      <div
        className="absolute bottom-[20%] right-[30%] w-3 h-3 bg-secondary/10 rounded-full animate-bounce"
        style={{ animationDuration: "4s" }}
      />
    </div>
  );
}
