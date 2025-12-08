"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PatternBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Abstract Waves - Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-0 right-0 w-full md:w-[50%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-700 fill-current opacity-20"
        >
          <motion.path
            d="M500,0 L500,800 L0,800 C150,650 50,450 150,300 C250,150 350,100 500,0 Z"
            initial={{ d: "M500,0 L500,800 L0,800 C150,650 50,450 150,300 C250,150 350,100 500,0 Z" }}
            animate={{
              d: [
                "M500,0 L500,800 L0,800 C150,650 50,450 150,300 C250,150 350,100 500,0 Z",
                "M500,0 L500,800 L0,800 C180,620 80,420 180,280 C270,130 380,80 500,0 Z",
                "M500,0 L500,800 L0,800 C150,650 50,450 150,300 C250,150 350,100 500,0 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-0 right-0 w-full md:w-[45%] h-full"
      >
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          className="w-full h-full text-red-600 fill-current opacity-25"
        >
          <motion.path
            d="M500,0 L500,800 L100,800 C250,600 150,350 250,200 C350,100 450,50 500,0 Z"
            initial={{ d: "M500,0 L500,800 L100,800 C250,600 150,350 250,200 C350,100 450,50 500,0 Z" }}
            animate={{
              d: [
                "M500,0 L500,800 L100,800 C250,600 150,350 250,200 C350,100 450,50 500,0 Z",
                "M500,0 L500,800 L100,800 C280,580 180,330 280,180 C370,90 470,40 500,0 Z",
                "M500,0 L500,800 L100,800 C250,600 150,350 250,200 C350,100 450,50 500,0 Z",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </svg>
      </motion.div>

      {/* Linear Gradient Blobs - Left Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-400/12 to-red-600/8 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-red-300/10 to-primary/8 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute -bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-red-500/12 to-red-400/8 blur-3xl"
      />

      {/* Subtle Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #D32F2F 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Linear Lines - Animated */}
      <svg className="absolute w-full h-full opacity-[0.08]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D32F2F" stopOpacity="0" />
            <stop offset="50%" stopColor="#D32F2F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D32F2F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.line
          x1="0"
          y1="60%"
          x2="100%"
          y2="60%"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Floating Geometric Elements */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 right-[10%] w-16 h-16 border-2 border-red-400/20 rounded-xl"
      />

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 left-[15%] w-12 h-12 border-2 border-red-300/20 rounded-lg"
      />
    </div>
  );
}
