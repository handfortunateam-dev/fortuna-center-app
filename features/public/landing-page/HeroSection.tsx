"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AbstractWaves from "@/components/backgrounds/AbstractWaves";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { HERO_STATS } from "@/constants/landingData";

const CAROUSEL_IMAGES = [
  "/images/07b4928819.webp",
  "/images/IMG_20260216_161803.webp",
  "/images/IMG_20260216_160400.webp",
  "/images/IMG_20260216_161724.webp",
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 bg-background overflow-hidden items-center flex min-h-[90vh]">
      {/* Abstract Background Shapes */}
      <AbstractWaves />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <Heading
              as="h1"
              className="text-5xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6 tracking-tight"
            >
              Fortuna Center <span className="text-primary">Kupang</span>
            </Heading>

            <Text className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Empowering individuals through{" "}
              <span className="text-secondary font-bold underline decoration-red-500/30 decoration-4 underline-offset-4">
                English mastery
              </span>
              , Human Resources Development, and professional{" "}
              <span className="text-secondary font-bold underline decoration-red-500/30 decoration-4 underline-offset-4">
                Broadcast Training
              </span>
              .
            </Text>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#programs"
                className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-all duration-300 shadow-xl shadow-red-600/30 hover:-translate-y-1 active:scale-95"
              >
                Explore Programs
              </Link>
              <Link
                href="#contact"
                className="px-8 py-4 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md text-foreground font-bold border border-border hover:bg-muted/80 transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-sm"
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8">
              {HERO_STATS.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon icon={stat.icon} className="text-xl" />
                  </div>
                  <Text weight="bold" size="sm" color="muted">
                    {stat.label}
                  </Text>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative w-full"
          >
            <div className="relative group w-full">
              {/* Decorative Glow */}
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-zinc-950 aspect-[4/3]">
                {/* Persistent Dark Overlay */}
                <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

                <AnimatePresence>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={CAROUSEL_IMAGES[currentIndex]}
                      alt="Fortuna Center Facility"
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Interior Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Navigation Dots */}
                <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                  {CAROUSEL_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentIndex === idx
                          ? "w-6 bg-primary"
                          : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* Label Overlay */}
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-white text-sm font-bold flex items-center gap-2">
                    <Icon icon="solar:camera-bold" className="text-primary" />
                    Our Facilities
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
