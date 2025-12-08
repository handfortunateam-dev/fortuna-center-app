"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import AbstractWaves from "@/components/backgrounds/AbstractWaves";

export default function BroadcastProgramPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <AbstractWaves />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-sm font-medium mb-6">
              <Icon icon="solar:microphone-3-bold" />
              <span>Professional Training</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Broadcast <span className="text-primary">Video & Audio</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Master the art of live broadcasting, audio engineering, and
              digital media production in our state-of-the-art studio.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                Join Program
              </button>
              <button className="px-8 py-3 bg-background text-foreground border border-border rounded-full font-semibold hover:bg-muted transition-colors">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Studio Equipment",
                description:
                  "Hands-on experience with professional cameras, lighting, and audio gear.",
                icon: "solar:camera-bold-duotone",
              },
              {
                title: "Live Streaming",
                description:
                  "Learn the technicalities of streaming to YouTube, Twitch, and other platforms.",
                icon: "solar:monitor-camera-bold-duotone",
              },
              {
                title: "Audio Engineering",
                description:
                  "Master mixing, mastering, and sound design for broadcast and podcasts.",
                icon: "solar:music-note-slider-bold-duotone",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-8 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300 hover:border-secondary/50 group"
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

      {/* Content Placeholder */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                <Icon icon="solar:gallery-wide-bold" className="text-6xl" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Real-World Experience
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our students don&apos;t just learn theory; they produce real
                content. From news segments to talk shows, you&apos;ll build a
                portfolio that stands out.
              </p>
              <ul className="space-y-4">
                {[
                  "Weekly Live Shows",
                  "Podcast Production",
                  "Event Coverage",
                  "Technical Direction",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <Icon icon="solar:check-read-bold" className="text-sm" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
