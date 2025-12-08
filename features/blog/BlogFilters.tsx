"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface BlogFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function BlogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: BlogFiltersProps) {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Icon
              icon="solar:magnifer-bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl"
            />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => onCategoryChange("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                !selectedCategory || selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted"
              }`}
            >
              All Articles
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.slug
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground hover:bg-muted"
                }`}
              >
                {category.name}
                {category.count !== undefined && (
                  <span className="ml-1.5 opacity-70">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
