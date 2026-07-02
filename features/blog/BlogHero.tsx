"use client";

import { Icon } from "@iconify/react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function BlogHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden mb-12"
    >
      {/* Parallax Background Image */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2573&auto=format&fit=crop"
          alt="Writing background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ opacity }} // Fade out content as you scroll down
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium mb-8 shadow-sm text-gray-200">
              <Icon
                icon="solar:pen-new-square-bold"
                className="text-primary-300 text-xl"
              />
              <span>Student Articles & Insights</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight drop-shadow-lg">
              Discover Stories from <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
                Fortuna Students
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto mb-12 drop-shadow-md font-light">
              Read articles, experiences, and insights shared by our students.
              From language learning tips to personal growth stories.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-gray-200">
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <Icon
                    icon="solar:document-text-bold"
                    className="text-2xl text-primary-300"
                  />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Articles
                  </div>
                </div>
              </div>

              <div className="w-px h-16 bg-white/10 hidden md:block" />

              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <Icon
                    icon="solar:users-group-rounded-bold"
                    className="text-2xl text-secondary-300"
                  />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Writers
                  </div>
                </div>
              </div>

              <div className="w-px h-16 bg-white/10 hidden md:block" />

              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <Icon
                    icon="solar:folder-with-files-bold"
                    className="text-2xl text-success-300"
                  />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10+</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Categories
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator Removed */}
    </section>
  );
}
