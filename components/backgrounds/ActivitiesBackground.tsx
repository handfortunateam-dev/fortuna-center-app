"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ActivitiesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary to-red-400 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-secondary to-yellow-400 blur-3xl"
      />

      {/* Animated Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-primary/10 rounded-full"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 right-1/5 w-24 h-24 border-4 border-secondary/10 rounded-full"
      />

      {/* Starburst/Energy Rays */}
      <svg
        className="absolute top-10 right-20 w-24 h-24 opacity-[0.08] text-primary"
        viewBox="0 0 100 100"
      >
        <path
          d="M50,0 L50,100 M0,50 L100,50 M15,15 L85,85 M85,15 L15,85"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Abstract Shapes */}
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        whileInView={{ opacity: 0.04, rotate: 15 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 right-10 w-40 h-40 bg-primary/20 rounded-3xl"
        style={{ transform: "skew(-10deg)" }}
      />

      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        whileInView={{ opacity: 0.04, rotate: -15 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute bottom-20 left-20 w-32 h-32 bg-secondary/20 rounded-2xl"
        style={{ transform: "skew(10deg)" }}
      />

      {/* Floating Particles */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
      <div
        className="absolute top-[60%] left-[70%] w-3 h-3 bg-secondary/20 rounded-full animate-bounce"
        style={{ animationDuration: "5s" }}
      />
      <div className="absolute bottom-[30%] left-[40%] w-2.5 h-2.5 bg-primary/15 rounded-full animate-pulse" />
      <div
        className="absolute top-[40%] right-[25%] w-2 h-2 bg-secondary/15 rounded-full animate-bounce"
        style={{ animationDuration: "7s" }}
      />

      {/* Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #D32F2F 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
