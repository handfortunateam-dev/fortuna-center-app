"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import GeometricBackground from "@/components/backgrounds/GeometricBackground";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { ABOUT_FEATURES } from "@/constants/landingData";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 bg-background relative overflow-hidden"
    >
      <GeometricBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Images Section */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Main Background Image (Exterior) */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 z-10">
                <Image
                  src="/images/IMG_20260216_155423.webp"
                  alt="Fortuna Center Building"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlapping Image (Activity) */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-8 -right-8 w-2/3 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 z-20 hidden md:block"
              >
                <Image
                  src="/images/IMG_20260216_161738.webp"
                  alt="Students at Fortuna Center"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Decorative Element */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2">
            <div className="mb-12">
              <Heading
                as="h2"
                className="text-3xl md:text-5xl font-extrabold text-foreground mb-6"
              >
                About Fortuna Center
              </Heading>
              <Text className="text-lg text-muted-foreground leading-relaxed mb-8">
                Fortuna English & Human Resources Development (HRD) Training
                Centre is a distinguished institution in Kupang. We are
                dedicated to bridging the gap between potential and professional
                success through comprehensive training programs.
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ABOUT_FEATURES.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon icon={item.icon} className="text-2xl" />
                  </div>
                  <Heading
                    as="h3"
                    className="text-lg font-bold text-foreground mb-2"
                  >
                    {item.title}
                  </Heading>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </Text>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
