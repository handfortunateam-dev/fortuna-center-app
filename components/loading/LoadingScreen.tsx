"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ParticleLoadingProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: ParticleLoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-xs"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Static Circle with Pulsing Logo */}
            <div className="relative flex items-center justify-center">
              {/* Static Outer circle */}
              <div className="absolute w-36 h-36 rounded-full border border-primary/20 bg-primary/5" />

              {/* Static Inner circle */}
              <div className="absolute w-32 h-32 rounded-full border border-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]" />

              {/* The Pulsing Logo */}
              <motion.div
                animate={{
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-24 h-24 z-10"
              >
                <Image
                  src="/android-chrome-192x192.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Simple loading text */}
            {/* <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-widest uppercase text-center">
                Fortuna Center
              </span>
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
