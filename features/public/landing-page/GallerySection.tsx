"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GalleryBackground from "@/components/backgrounds/GalleryBackground";

export default function GallerySection() {
  const images = [
    "/images/19b823d30b.webp", // Lead (Top Left)
    "/images/2c4f1f2b89.webp", // Top Right
    "/images/4b3ff0910a.webp", // Bottom Left
    "/images/d25252d6bc.webp", // Bottom Right (Span 2)
  ];

  return (
    <section className="py-24 bg-muted relative overflow-hidden">
      <GalleryBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Life at Fortuna Center
          </h2>
          <p className="text-muted-foreground text-lg">
            A glimpse into our vibrant learning environment and activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`relative rounded-xl overflow-hidden shadow-sm group h-64 ${
                idx === 0 || idx === 3 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <Image
                src={src}
                alt={`Gallery Image ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
