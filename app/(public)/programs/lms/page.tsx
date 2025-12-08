"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import GeometricBackground from "@/components/backgrounds/GeometricBackground";

export default function LMSProgramPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="overview" className="relative py-24 overflow-hidden">
        <GeometricBackground />
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
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              LMS for <span className="text-primary">English Mastery</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              A comprehensive Learning Management System designed to accelerate
              your English proficiency through interactive lessons and tracking.
            </p>
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
            {[
              {
                title: "Interactive Lessons",
                description:
                  "Engaging video lessons, quizzes, and exercises tailored to your level.",
                icon: "solar:laptop-minimalistic-bold-duotone",
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your improvement with detailed analytics and performance reports.",
                icon: "solar:chart-2-bold-duotone",
              },
              {
                title: "Certified Teachers",
                description:
                  "Get feedback and guidance from experienced English instructors.",
                icon: "solar:user-id-bold-duotone",
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
      <section id="benefits" className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                <Icon icon="solar:laptop-bold" className="text-6xl" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Learn Anywhere, Anytime
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our platform is accessible on all devices, allowing you to study
                at your own pace. Whether you&apos;re a beginner or advanced
                learner, we have the right path for you.
              </p>
              <ul className="space-y-4">
                {[
                  "Mobile Friendly",
                  "Offline Access",
                  "Community Forums",
                  "Certificate of Completion",
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
