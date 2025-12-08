"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import ActivitiesBackground from "@/components/backgrounds/ActivitiesBackground";

export default function ActivitiesSection() {
  return (
    <section id="activities" className="py-20 bg-muted relative overflow-hidden">
      <ActivitiesBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-default-900 mb-4">
              Our Activities
            </h2>
            <p className="text-default-500 text-lg max-w-2xl mx-auto">
              We actively organize events and competitions to foster talent and
              build confidence.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl border border-default-200 bg-background shadow-sm hover:shadow-xl transition-all"
          >
            <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <Icon
                icon="solar:microphone-3-bold-duotone"
                className="absolute bottom-4 right-4 text-6xl text-white/30 rotate-12"
              />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                <Icon icon="solar:calendar-bold" />
                <span>2019 Highlight</span>
              </div>
              <h3 className="text-2xl font-bold text-default-900 mb-3">
                English Speech Competition
              </h3>
              <p className="text-default-500 leading-relaxed mb-6">
                A prestigious competition that brought together talented
                speakers to showcase their English proficiency and public
                speaking skills.
              </p>
              <div className="flex items-center gap-2 text-sm text-default-400">
                <Icon icon="solar:users-group-rounded-bold" />
                <span>Participants from various schools</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl border border-default-200 bg-background shadow-sm hover:shadow-xl transition-all"
          >
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <Icon
                icon="solar:hand-shake-bold-duotone"
                className="absolute bottom-4 right-4 text-6xl text-white/30 rotate-12"
              />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 text-purple-600 font-semibold mb-3">
                <Icon icon="solar:star-bold" />
                <span>Our Partners</span>
              </div>
              <h3 className="text-2xl font-bold text-default-900 mb-3">
                Strategic Partnerships
              </h3>
              <p className="text-default-500 leading-relaxed mb-6">
                Collaborating with esteemed organizations like{" "}
                <strong>HAND International</strong> to deliver world-class
                training and opportunities.
              </p>
              <div className="flex items-center gap-2 text-sm text-default-400">
                <Icon icon="solar:globe-bold" />
                <span>International Collaboration</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
