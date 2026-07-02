"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ParticleLoadingProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: ParticleLoadingProps) {
  return (
    <>
      {/* Preload image to ensure it's available immediately when loading starts */}
      <div className="hidden">
        <img src="/android-chrome-192x192.png" alt="preload" />
      </div>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-[0.1px]"
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
                    unoptimized // Ensure we use the direct file allowing browser caching from the preloaded img
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
