"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { LMS_PROGRAM_DATA } from "@/constants/programsData";

export default function LMSProgramPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="overview" className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-sm font-medium mb-6">
              <Icon icon="solar:book-bookmark-bold" />
              <span>Digital Learning</span>
            </div>
            <Heading
              as="h1"
              size="4xl"
              align="center"
              className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              LMS for <span className="text-primary">English Mastery</span>
            </Heading>
            <Text
              align="center"
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8"
            >
              A comprehensive Learning Management System designed to accelerate
              your English proficiency through interactive lessons and tracking.
            </Text>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                Access Portal
              </button>
              <button className="px-8 py-3 bg-background text-foreground border border-border rounded-full font-semibold hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LMS_PROGRAM_DATA.features.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-8 rounded-3xl border border-border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/30 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon icon={item.icon} className="text-3xl" />
                </div>
                <Heading
                  as="h3"
                  className="text-xl font-bold text-foreground mb-3"
                >
                  {item.title}
                </Heading>
                <Text className="text-muted-foreground leading-relaxed">
                  {item.description}
                </Text>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="benefits" className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-background/50 backdrop-blur-sm border border-border rounded-2xl flex items-center justify-center text-muted-foreground shadow-xl">
                <Icon
                  icon="solar:laptop-bold"
                  className="text-6xl text-primary/20"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <Heading
                as="h2"
                className="text-3xl font-bold text-foreground mb-6"
              >
                Learn Anywhere, Anytime
              </Heading>
              <Text className="text-muted-foreground leading-relaxed mb-6">
                Our platform is accessible on all devices, allowing you to study
                at your own pace. Whether you&apos;re a beginner or advanced
                learner, we have the right path for you.
              </Text>
              <ul className="space-y-4">
                {LMS_PROGRAM_DATA.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <Icon icon="solar:check-read-bold" className="text-sm" />
                    </div>
                    <Text weight="medium" className="text-foreground">
                      {item}
                    </Text>
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
