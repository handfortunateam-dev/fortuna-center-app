"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AbstractWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1 - Deepest Red (Background Shape) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-0 right-0 w-full md:w-[60%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-700 fill-current opacity-90"
        >
          <path d="M500,0 L500,800 L0,800 C200,600 0,400 200,200 C300,100 400,50 500,0 Z" />
        </svg>
      </motion.div>

      {/* Layer 2 - Mid Red (Flowing Wave) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-0 right-0 w-full md:w-[55%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-600 fill-current opacity-80"
        >
          <path d="M500,0 L500,800 L100,800 C300,600 100,300 300,100 C400,50 450,20 500,0 Z" />
        </svg>
      </motion.div>

      {/* Layer 3 - Bright Red (Accent) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-0 right-0 w-full md:w-[45%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-500 fill-current opacity-90"
        >
          <path d="M500,0 L500,800 L200,800 C400,500 200,300 400,100 C450,50 480,10 500,0 Z" />
        </svg>
      </motion.div>

      {/* Layer 4 - Highlight */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute top-0 right-0 w-full md:w-[35%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-400 fill-current opacity-60"
        >
          <path d="M500,0 L500,800 L300,800 C450,600 300,400 450,100 C480,50 490,10 500,0 Z" />
        </svg>
      </motion.div>

      {/* Floating Particles/Circles - Adjusted positions */}
      <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-white/30 rounded-full blur-[1px] animate-pulse" />
      <div
        className="absolute top-[40%] right-[20%] w-6 h-6 bg-white/20 rounded-full blur-sm animate-bounce"
        style={{ animationDuration: "4s" }}
      />
      <div className="absolute bottom-[30%] right-[15%] w-4 h-4 bg-red-200/30 rounded-full blur-[1px]" />
    </div>
  );
}
