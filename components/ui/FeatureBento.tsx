"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

interface BentoItemProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
  delay?: number;
}

function BentoItem({
  title,
  description,
  icon,
  className = "",
  delay = 0,
}: BentoItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300 ${className}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon icon={icon} className="text-8xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon icon={icon} className="text-2xl" />
        </div>

        <div>
          <Heading as="h3" className="text-xl font-bold mb-2">
            {title}
          </Heading>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </Text>
        </div>
      </div>
    </motion.div>
  );
}

export function FeatureBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[300px]">
      <BentoItem
        title="Interactive LMS"
        description="Access learning materials, submit assignments, and track your grades in one modern platform."
        icon="solar:globus-bold"
        className="md:col-span-2 md:row-span-1"
        delay={0.1}
      />
      <BentoItem
        title="Expert Tutors"
        description="Learn from certified native and professional local instructors."
        icon="solar:user-speak-bold"
        className="md:col-span-1 md:row-span-1"
        delay={0.2}
      />
      <BentoItem
        title="Certifications"
        description="Earn recognized certificates upon completion."
        icon="solar:diploma-bold"
        className="md:col-span-1 md:row-span-1"
        delay={0.3}
      />
      <BentoItem
        title="Broadcast Training"
        description="Fully equipped multi-camera studio, audio mastering suites, and live streaming gear for hands-on media production."
        icon="solar:videocamera-record-bold"
        className="md:col-span-1 md:row-span-1"
        delay={0.4}
      />
      <BentoItem
        title="Global Career Prep"
        description="English courses specifically designed for business, hospitality, and broadcasting professionals."
        icon="solar:chart-square-bold"
        className="md:col-span-2 md:row-span-1"
        delay={0.5}
      />
      <BentoItem
        title="24/7 Access"
        description="Study anytime with our digital library and archive."
        icon="solar:clock-circle-bold"
        className="md:col-span-1 md:row-span-1"
        delay={0.6}
      />
    </div>
  );
}
