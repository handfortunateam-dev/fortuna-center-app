"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AbstractWaves from "@/components/backgrounds/AbstractWaves";
import HeroDecorations from "@/components/backgrounds/HeroDecorations";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 bg-background overflow-hidden">
      {/* Abstract Background Shapes */}
      <AbstractWaves />
      {/* <HeroDecorations /> */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-sm font-medium mb-6 border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Premier Training Center
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Fortuna Center <span className="text-primary">Kupang</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Empowering individuals through{" "}
              <span className="text-secondary font-semibold">
                English mastery
              </span>
              , Human Resources Development, and professional{" "}
              <span className="text-secondary font-semibold">
                Broadcast Training
              </span>
              .
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#programs"
                className="px-8 py-4 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Explore Programs
              </Link>
              <Link
                href="#contact"
                className="px-8 py-4 rounded-lg bg-card text-foreground font-semibold border border-border hover:bg-muted transition-colors"
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold"
                  className="text-2xl text-secondary"
                />
                <span className="text-sm font-medium">Expert Trainers</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:diploma-verified-bold"
                  className="text-2xl text-secondary"
                />
                <span className="text-sm font-medium">Certified Courses</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
              <div className="aspect-[4/3] bg-muted relative">
                {/* Placeholder for professional environment */}
                <Image
                  src="/images/07b4928819.webp"
                  alt="Professional Broadcast Studio"
                  fill
                  className="object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRlIAAABXRUJQVlA4IE4AAADwAQCdASnoACQAAUAmJaQAA3AA/v89WAAAAA==" // Simple grey blur
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-multiply z-10" />
              </div>

              {/* Floating Card */}
              {/* <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary">
                    <Icon
                      icon="solar:videocamera-record-bold"
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Live Broadcast</p>
                    <p className="text-xs text-muted-foreground">
                      Professional Studio
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div className="bg-secondary h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  Streaming Quality 4K
                </p>
              </div> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
