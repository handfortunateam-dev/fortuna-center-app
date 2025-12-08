"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GalleryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large Gradient Blobs - VERY VISIBLE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/30 to-red-400/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-secondary/25 to-yellow-300/15 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-red-300/20 to-primary/15 blur-3xl"
      />

      {/* Large Geometric Shapes */}
      <motion.div
        initial={{ opacity: 0, rotate: -20 }}
        whileInView={{ opacity: 0.08, rotate: -10 }}
        transition={{ duration: 1.5 }}
        className="absolute top-20 left-20 w-96 h-72 border-8 border-primary/15 rounded-3xl"
        style={{ transform: "rotate(-10deg)" }}
      />

      <motion.div
        initial={{ opacity: 0, rotate: 15 }}
        whileInView={{ opacity: 0.08, rotate: 8 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-20 right-20 w-[500px] h-80 border-8 border-secondary/15 rounded-3xl"
        style={{ transform: "rotate(8deg)" }}
      />

      {/* Abstract Wave Patterns */}
      <svg
        className="absolute w-full h-full opacity-[0.08] text-primary"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M0,700 Q250,800 500,700 T1000,700 L1000,1000 L0,1000 Z"
          fill="currentColor"
          opacity="0.2"
          className="text-secondary"
        />
      </svg>

      {/* Grid Pattern - More Visible */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, #D32F2F 2px, transparent 2px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Diagonal Lines Pattern */}
      <svg className="absolute w-full h-full opacity-[0.06]">
        <defs>
          <pattern
            id="diagonal-lines"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="40"
              stroke="#D32F2F"
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
      </svg>

      {/* Large Abstract Shapes */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 0.06, x: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 0.06, x: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-2xl"
      />
    </div>
  );
}
