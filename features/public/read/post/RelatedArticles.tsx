import BlogCard from "@/features/blog/BlogCard";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";

interface RelatedArticle {
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

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <Heading as="h2" size="2xl" className="mb-2">
            Related Articles
          </Heading>
          <Text size="sm" color="muted" className="mb-8">
            More articles you might enjoy
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <BlogCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
