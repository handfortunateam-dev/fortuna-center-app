"use client";

import { motion, AnimatePresence } from "framer-motion";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Minimal spinner with single rotating ring */}
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <motion.div className="absolute inset-0 rounded-full border-2 border-gray-200" />

              {/* Animated arc */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>

            {/* Simple loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium text-gray-700">Loading</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
