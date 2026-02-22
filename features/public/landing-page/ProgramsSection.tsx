"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PatternBackground from "@/components/backgrounds/PatternBackground";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
 
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
            <Heading
              as="h2"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Our Core Programs
            </Heading>
            <Text className="text-muted-foreground text-lg">
              Specialized training designed to equip you with modern skills for
              the digital age.
            </Text>
          </div>
          <button className="px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-all duration-300">
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
              <Heading
                as="h3"
                className="text-3xl font-bold text-foreground mb-6"
              >
                Broadcast Live Audio & Video
              </Heading>
              <Text className="text-muted-foreground text-lg leading-relaxed mb-8">
                Master the art of broadcasting with our comprehensive training
                program. Learn to operate professional equipment, manage live
                streams, and produce high-quality audio and video content.
              </Text>

              <ul className="space-y-4 mb-8">
                {[
                  "Professional Camera Operation",
                  "Audio Mixing & Sound Engineering",
                  "Live Streaming Management",
                  "Content Production Workflow",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-primary text-xl"
                    />
                    <Text weight="medium" className="text-foreground">
                      {item}
                    </Text>
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
              <div className="aspect-video rounded-2xl overflow-hidden bg-muted shadow-2xl border border-white/20">
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
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-2xl border border-white/20">
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
              <Heading
                as="h3"
                className="text-3xl font-bold text-foreground mb-6"
              >
                English Proficiency
              </Heading>
              <Text className="text-muted-foreground text-lg leading-relaxed mb-8">
                Elevate your communication skills with our structured English
                courses. From public speaking to business English, we prepare
                you for global opportunities.
              </Text>

              <ul className="space-y-4 mb-8">
                {[
                  "Public Speaking & Debate",
                  "Business English Communication",
                  "TOEFL & IELTS Preparation",
                  "Interactive Learning Environment",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-primary text-xl"
                    />
                    <Text weight="medium" className="text-foreground">
                      {item}
                    </Text>
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
