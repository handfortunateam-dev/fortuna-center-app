"use client";

import { useState, useMemo } from "react";
import BlogHero from "@/features/blog/BlogHero";
import BlogFilters from "@/features/blog/BlogFilters";
import HeroBlog from "@/features/blog/HeroBlog";
import BlogList from "@/features/blog/BlogList";
import { useBlogPosts, useBlogCategories } from "@/services/blogService";
import { Button, Spinner } from "@heroui/react";
import { Heading } from "@/components/heading";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: posts = [], isLoading: postsLoading } = useBlogPosts({
    q: searchQuery,
  });

  const { data: categories = [], isLoading: categoriesLoading } =
    useBlogCategories();

  // Filter and map articles for the components
  const articles = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesCategory =
          selectedCategory === "all" ||
          post.categories.some((cat) => cat.slug === selectedCategory);
        return matchesCategory;
      })
      .map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || undefined,
        author: {
          name: post.author.name || "Admin",
          image: post.author.image || undefined,
        },
        publishedAt: new Date(post.publishedAt || post.createdAt),
        readTime: Math.ceil(post.content.split(" ").length / 200) || 5, // Basic read time calc
        categories: post.categories.map((c) => ({
          name: c.name,
          slug: c.slug,
        })),
        viewCount: post.viewCount,
        likeCount: post.likeCount,
      }));
  }, [posts, selectedCategory]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles =
    articles.length > 1
      ? articles.slice(1)
      : articles.length === 1 &&
          (selectedCategory !== "all" || searchQuery !== "")
        ? articles
        : [];

  const isLoading = postsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <BlogHero />

      {/* Filters */}
      <BlogFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner
                size="lg"
                color="primary"
                label="Fetching latest stories..."
              />
            </div>
          ) : (
            <>
              {/* Featured Article - Only show if no filters applied and we have posts */}
              {selectedCategory === "all" &&
                searchQuery === "" &&
                featuredArticle && <HeroBlog {...featuredArticle} />}

              {/* Results Grid Label */}
              <div className="mb-8 mt-12">
                <Heading className="text-2xl font-bold text-foreground">
                  {selectedCategory === "all"
                    ? searchQuery
                      ? "Search Results"
                      : "Latest Articles"
                    : `${categories.find((c) => c.slug === selectedCategory)?.name || "Category"} Articles`}
                </Heading>
                <p className="text-muted-foreground mt-1">
                  {articles.length}{" "}
                  {articles.length === 1 ? "article" : "articles"} found
                </p>
              </div>

              {/* Articles Grid */}
              <BlogList
                articles={
                  selectedCategory === "all" && searchQuery === ""
                    ? remainingArticles
                    : articles
                }
              />

              {/* Load More Button (Only if needed and we have data) */}
              {articles.length > 0 && (
                <div className="mt-12 text-center">
                  <Button className="px-8 py-3 rounded-lg border-2 border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-colors">
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
