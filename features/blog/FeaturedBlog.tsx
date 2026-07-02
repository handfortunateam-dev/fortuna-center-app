"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heading } from "@/components/heading";

interface FeaturedBlogProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: {
    name: string;
    image?: string;
  };
  publishedAt: Date;
  readTime?: number;
  categories?: { name: string; slug: string }[];
}

export default function HeroBlog({
  title,
  slug,
  excerpt,
  coverImage,
  author,
  publishedAt,
  readTime = 5,
  categories = [],
}: FeaturedBlogProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-3xl overflow-hidden border border-border">
        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
          {/* Content */}
          <div className="flex flex-col justify-center">
            {categories.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-background text-primary text-xs font-semibold border border-primary/20">
                  {categories[0].name}
                </span>
              </div>
            )}

            <Link href={`/blog/read/${slug}`}>
              <Heading
                as="h2"
                size="3xl"
                weight="bold"
                className="text-foreground mb-4 hover:text-primary transition-colors line-clamp-3"
              >
                {title}
              </Heading>
            </Link>

            <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
              {excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {author.image ? (
                    <Image
                      src={author.image}
                      alt={author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="font-medium text-foreground">
                  {author.name}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Icon icon="solar:calendar-bold" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Icon icon="solar:clock-circle-bold" />
                <span>{readTime} min</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/blog/read/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors w-fit group"
            >
              Read Full Article
              <Icon
                icon="solar:arrow-right-bold"
                className="text-lg group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Image */}
          <Link
            href={`/blog/read/${slug}`}
            className="relative aspect-[4/3] md:aspect-auto rounded-2xl overflow-hidden bg-muted group"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Icon
                  icon="solar:gallery-bold"
                  className="text-8xl text-muted-foreground"
                />
              </div>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
