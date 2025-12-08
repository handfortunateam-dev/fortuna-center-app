"use client";

import { useState } from "react";
import BlogHero from "@/features/blog/BlogHero";
import BlogFilters from "@/features/blog/BlogFilters";
import FeaturedBlog from "@/features/blog/FeaturedBlog";
import BlogList from "@/features/blog/BlogList";

// Mock data - Replace with actual database queries later
const mockCategories = [
  { id: "1", name: "English Tips", slug: "english-tips", count: 15 },
  { id: "2", name: "Student Life", slug: "student-life", count: 22 },
  { id: "3", name: "Language Learning", slug: "language-learning", count: 18 },
  { id: "4", name: "Success Stories", slug: "success-stories", count: 12 },
  { id: "5", name: "Study Abroad", slug: "study-abroad", count: 8 },
];

const mockArticles = [
  {
    id: "1",
    title: "10 Tips to Improve Your English Speaking Skills",
    slug: "10-tips-improve-english-speaking",
    excerpt: "Discover effective strategies to boost your English speaking confidence and fluency. From daily practice routines to conversation techniques.",
    coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop",
    author: { name: "Maria Santos", image: "" },
    publishedAt: new Date("2024-01-15"),
    readTime: 8,
    categories: [{ name: "English Tips", slug: "english-tips" }],
    viewCount: 245,
    likeCount: 32,
  },
  {
    id: "2",
    title: "My Journey Learning English at Fortuna Center",
    slug: "my-journey-learning-english-fortuna",
    excerpt: "A personal story about overcoming language barriers and finding confidence through consistent practice and supportive teachers.",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    author: { name: "John Doe", image: "" },
    publishedAt: new Date("2024-01-12"),
    readTime: 6,
    categories: [{ name: "Success Stories", slug: "success-stories" }],
    viewCount: 189,
    likeCount: 28,
  },
  {
    id: "3",
    title: "Essential Grammar Rules Every Beginner Should Know",
    slug: "essential-grammar-rules-beginners",
    excerpt: "Master the fundamental grammar concepts that will form the foundation of your English language journey.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop",
    author: { name: "Sarah Johnson", image: "" },
    publishedAt: new Date("2024-01-10"),
    readTime: 10,
    categories: [{ name: "Language Learning", slug: "language-learning" }],
    viewCount: 312,
    likeCount: 45,
  },
  {
    id: "4",
    title: "How to Prepare for TOEFL Test: A Complete Guide",
    slug: "how-to-prepare-toefl-test",
    excerpt: "Everything you need to know about TOEFL preparation, from study strategies to test-taking tips that actually work.",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    author: { name: "Michael Chen", image: "" },
    publishedAt: new Date("2024-01-08"),
    readTime: 12,
    categories: [{ name: "Study Abroad", slug: "study-abroad" }],
    viewCount: 428,
    likeCount: 56,
  },
  {
    id: "5",
    title: "A Day in the Life of a Fortuna Student",
    slug: "day-in-life-fortuna-student",
    excerpt: "Follow along as I take you through a typical day at Fortuna Center, from morning classes to evening study groups.",
    coverImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop",
    author: { name: "Lisa Anderson", image: "" },
    publishedAt: new Date("2024-01-05"),
    readTime: 7,
    categories: [{ name: "Student Life", slug: "student-life" }],
    viewCount: 267,
    likeCount: 38,
  },
  {
    id: "6",
    title: "Common English Pronunciation Mistakes and How to Fix Them",
    slug: "common-pronunciation-mistakes",
    excerpt: "Learn about the most frequent pronunciation errors Indonesian speakers make and practical exercises to correct them.",
    coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop",
    author: { name: "David Kim", image: "" },
    publishedAt: new Date("2024-01-03"),
    readTime: 9,
    categories: [{ name: "English Tips", slug: "english-tips" }],
    viewCount: 356,
    likeCount: 42,
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter articles based on category and search
  const filteredArticles = mockArticles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" ||
      article.categories.some((cat) => cat.slug === selectedCategory);

    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Get featured article (most recent)
  const featuredArticle = mockArticles[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <BlogHero />

      {/* Filters */}
      <BlogFilters
        categories={mockCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Featured Article - Only show if no filters applied */}
          {selectedCategory === "all" && searchQuery === "" && (
            <FeaturedBlog {...featuredArticle} />
          )}

          {/* Results Count */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory === "all" ? "All Articles" : `${mockCategories.find(c => c.slug === selectedCategory)?.name} Articles`}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"} found
            </p>
          </div>

          {/* Articles Grid */}
          <BlogList articles={filteredArticles} />

          {/* Load More Button */}
          {filteredArticles.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 rounded-lg border-2 border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-colors">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
