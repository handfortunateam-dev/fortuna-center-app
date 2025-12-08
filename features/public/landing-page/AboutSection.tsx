"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import GeometricBackground from "@/components/backgrounds/GeometricBackground";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <GeometricBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            About Fortuna Center
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fortuna English & Human Resources Development (HRD) Training Centre
            is a distinguished institution in Kupang. We are dedicated to
            bridging the gap between potential and professional success through
            comprehensive training programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Language Mastery",
              description:
                "Comprehensive English language training designed for all proficiency levels.",
              icon: "solar:book-bookmark-bold",
            },
            {
              title: "HR Development",
              description:
                "Strategic human resources training to build effective and professional teams.",
              icon: "solar:users-group-two-rounded-bold",
            },
            {
              title: "Broadcast Training",
              description:
                "State-of-the-art facility for learning live audio and video broadcasting.",
              icon: "solar:microphone-3-bold",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:border-secondary/50 group"
            >
              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center text-primary mb-6 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors duration-300">
                <Icon icon={item.icon} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
