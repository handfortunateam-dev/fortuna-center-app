"use client";

import BlogCard from "./BlogCard";
import { StateMessage } from "@/components/state-message";

interface Article {
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

interface BlogListProps {
  articles: Article[];
  isLoading?: boolean;
}

export default function BlogList({ articles, isLoading }: BlogListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted aspect-[16/9] rounded-2xl mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <StateMessage
        type="empty"
        title="No articles found"
        message="Try adjusting your search or filter criteria"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <BlogCard key={article.id} {...article} />
      ))}
    </div>
  );
}
