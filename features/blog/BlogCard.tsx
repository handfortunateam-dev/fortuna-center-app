"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
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
  viewCount?: number;
  likeCount?: number;
}

export default function BlogCard({
  title,
  slug,
  excerpt,
  coverImage,
  author,
  publishedAt,
  readTime = 5,
  categories = [],
  viewCount = 0,
  likeCount = 0,
}: BlogCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-background rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
    >
      {/* Cover Image */}
      <Link href={`/read/${slug}`} className="block relative aspect-[16/9] overflow-hidden bg-muted">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Icon icon="solar:document-text-bold" className="text-6xl text-muted-foreground" />
          </div>
        )}

        {/* Category Badge */}
        {categories.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-primary text-xs font-semibold">
              {categories[0].name}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Icon icon="solar:calendar-bold" />
            <span>{formattedDate}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Icon icon="solar:clock-circle-bold" />
            <span>{readTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/read/${slug}`}>
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                author.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm text-foreground font-medium">{author.name}</span>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <Icon icon="solar:eye-bold" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="solar:heart-bold" />
              <span>{likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
