"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function BlogHero() {
  return (
    <section className="relative pt-32 pb-20 bg-background overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-background to-blue-50" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium mb-6 shadow-sm">
              <Icon icon="solar:pen-new-square-bold" className="text-primary text-xl" />
              <span className="text-foreground">Student Articles & Insights</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Discover Stories from <br />
              <span className="text-primary">Fortuna Students</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Read articles, experiences, and insights shared by our students.
              From language learning tips to personal growth stories.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon icon="solar:document-text-bold" className="text-2xl text-secondary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">100+</div>
                  <div className="text-sm">Articles</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:users-group-rounded-bold" className="text-2xl text-secondary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">50+</div>
                  <div className="text-sm">Writers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:folder-with-files-bold" className="text-2xl text-secondary" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">10+</div>
                  <div className="text-sm">Categories</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
