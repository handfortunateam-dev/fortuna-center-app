"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import PatternBackground from "@/components/backgrounds/PatternBackground";

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="py-24 bg-background relative overflow-hidden"
    >
      <PatternBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Programs
            </h2>
            <p className="text-muted-foreground text-lg">
              Specialized training designed to equip you with modern skills for
              the digital age.
            </p>
          </div>
          <button className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
            View All Programs
          </button>
        </div>

        <div className="space-y-24">
          {/* Broadcast Program */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-sm font-medium mb-6">
                <Icon
                  icon="solar:record-circle-bold"
                  className="animate-pulse"
                />
                Live On Air
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Broadcast Live Audio & Video
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Master the art of broadcasting with our comprehensive training
                program. Learn to operate professional equipment, manage live
                streams, and produce high-quality audio and video content.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Professional Camera Operation",
                  "Audio Mixing & Sound Engineering",
                  "Live Streaming Management",
                  "Content Production Workflow",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-primary text-xl"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex gap-4 mt-8">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  <Icon icon="solar:play-circle-bold" className="text-xl" />
                  See Live Demo
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg">
                {/* Placeholder for broadcast studio */}
                <Image
                  src="/images/90860f20ca.webp"
                  alt="Broadcast Studio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>

          {/* English Program */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-lg">
                {/* Placeholder for classroom */}
                <Image
                  src="/images/9ec276cda4.webp"
                  alt="English Classroom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-sm font-medium mb-6">
                <Icon icon="solar:global-bold" />
                Global Communication
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                English Proficiency
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Elevate your communication skills with our structured English
                courses. From public speaking to business English, we prepare
                you for global opportunities.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Public Speaking & Debate",
                  "Business English Communication",
                  "TOEFL & IELTS Preparation",
                  "Interactive Learning Environment",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-primary text-xl"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
