"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Circle 1 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl"
      />

      {/* Circle 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl"
      />

      {/* Square 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 w-20 h-20 border-2 border-primary/30 rounded-2xl opacity-30"
      />

      {/* Square 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 left-1/5 w-12 h-12 border-2 border-secondary/40 rounded-xl opacity-40"
      />

      {/* Triangle (SVG) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 0.15, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-10 w-32 h-32 text-primary"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <path d="M50 15 L90 85 L10 85 Z" />
        </svg>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-red-400/20 rounded-full animate-pulse" />
      <div
        className="absolute bottom-[25%] left-[10%] w-3 h-3 bg-primary/10 rounded-full animate-bounce"
        style={{ animationDuration: "5s" }}
      />
      <div className="absolute top-[40%] left-[40%] w-1.5 h-1.5 bg-secondary/20 rounded-full blur-[0.5px]" />
    </div>
  );
}
