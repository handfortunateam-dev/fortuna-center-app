"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BlogCard from "@/features/blog/BlogCard";

// Mock data - Replace with actual database query
const mockArticle = {
  id: "1",
  title: "10 Tips to Improve Your English Speaking Skills",
  slug: "10-tips-improve-english-speaking",
  content: `
    <p>Learning to speak English fluently is a journey that requires dedication, practice, and the right strategies. Whether you're a beginner or looking to refine your skills, these proven tips will help you become a more confident English speaker.</p>

    <h2>1. Practice Every Day</h2>
    <p>Consistency is key when learning a new language. Set aside at least 15-30 minutes daily for speaking practice. This regular exposure helps your brain adapt to English pronunciation patterns and builds muscle memory for forming words correctly.</p>

    <h2>2. Think in English</h2>
    <p>One of the most effective ways to improve fluency is to start thinking in English. Try to narrate your daily activities in your mind using English. This mental practice strengthens your ability to form sentences naturally without translating from your native language.</p>

    <h2>3. Record Yourself Speaking</h2>
    <p>Recording your voice helps you identify pronunciation issues and track your progress. Listen to your recordings and compare them with native speakers. This self-awareness is crucial for improvement.</p>

    <h2>4. Join Conversation Groups</h2>
    <p>At Fortuna Center, we offer regular conversation groups where students can practice with peers. Speaking with others in a supportive environment builds confidence and exposes you to different accents and speaking styles.</p>

    <h2>5. Watch English Media</h2>
    <p>Movies, TV shows, and YouTube videos in English expose you to natural conversation patterns, idioms, and pronunciation. Start with subtitles if needed, then gradually remove them as you improve.</p>

    <h2>6. Don't Fear Mistakes</h2>
    <p>Making mistakes is a natural part of learning. Each error is an opportunity to improve. Native speakers understand that you're learning and will appreciate your efforts to communicate in their language.</p>

    <h2>7. Learn Phrases, Not Just Words</h2>
    <p>Instead of memorizing individual words, learn common phrases and expressions. This approach helps you speak more naturally and understand context better.</p>

    <h2>8. Read Out Loud</h2>
    <p>Reading English texts aloud improves pronunciation, rhythm, and intonation. Choose materials that interest you, from news articles to fiction books, and practice reading them with proper expression.</p>

    <h2>9. Use Language Learning Apps</h2>
    <p>Complement your classroom learning with apps that offer speaking exercises. Many apps use speech recognition to provide instant feedback on your pronunciation.</p>

    <h2>10. Get a Speaking Partner</h2>
    <p>Find a language exchange partner or work with a tutor who can provide regular speaking practice. One-on-one conversations allow for personalized feedback and targeted improvement.</p>

    <h2>Conclusion</h2>
    <p>Improving your English speaking skills takes time and dedication, but with these strategies and consistent practice, you'll see significant progress. Remember, every fluent English speaker was once a beginner. Keep practicing, stay motivated, and don't give up!</p>

    <p>At Fortuna English Center, we're here to support your language learning journey. Join our conversation classes and work with experienced teachers who can help you achieve your English speaking goals.</p>
  `,
  excerpt: "Discover effective strategies to boost your English speaking confidence and fluency. From daily practice routines to conversation techniques.",
  coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop",
  author: {
    name: "Maria Santos",
    image: "",
    bio: "English instructor at Fortuna Center with 5 years of teaching experience.",
  },
  publishedAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  readTime: 8,
  categories: [{ name: "English Tips", slug: "english-tips" }],
  tags: ["speaking", "fluency", "practice", "tips"],
  viewCount: 245,
  likeCount: 32,
};

const relatedArticles = [
  {
    id: "2",
    title: "Common English Pronunciation Mistakes",
    slug: "common-pronunciation-mistakes",
    excerpt: "Learn about the most frequent pronunciation errors and how to fix them.",
    coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop",
    author: { name: "David Kim", image: "" },
    publishedAt: new Date("2024-01-03"),
    readTime: 9,
    categories: [{ name: "English Tips", slug: "english-tips" }],
    viewCount: 356,
    likeCount: 42,
  },
  {
    id: "3",
    title: "My Journey Learning English at Fortuna",
    slug: "my-journey-learning-english-fortuna",
    excerpt: "A personal story about overcoming language barriers.",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    author: { name: "John Doe", image: "" },
    publishedAt: new Date("2024-01-12"),
    readTime: 6,
    categories: [{ name: "Success Stories", slug: "success-stories" }],
    viewCount: 189,
    likeCount: 28,
  },
];

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mockArticle.likeCount);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const formattedDate = mockArticle.publishedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Icon icon="solar:alt-arrow-right-linear" />
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <Icon icon="solar:alt-arrow-right-linear" />
            <span className="text-foreground font-medium">{mockArticle.categories[0].name}</span>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Badge */}
              <Link
                href={`/blog?category=${mockArticle.categories[0].slug}`}
                className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold mb-6 hover:bg-red-700 transition-colors"
              >
                {mockArticle.categories[0].name}
              </Link>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {mockArticle.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                    {mockArticle.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{mockArticle.author.name}</div>
                    <div className="text-sm text-muted-foreground">Author</div>
                  </div>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Icon icon="solar:calendar-bold" className="text-xl" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:clock-circle-bold" className="text-xl" />
                  <span>{mockArticle.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:eye-bold" className="text-xl" />
                  <span>{mockArticle.viewCount} views</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {mockArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-muted text-foreground text-sm hover:bg-muted transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="pb-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              {mockArticle.coverImage ? (
                <Image
                  src={mockArticle.coverImage}
                  alt={mockArticle.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Icon icon="solar:gallery-bold" className="text-9xl text-muted-foreground" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-12">
              {/* Main Content */}
              <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="prose prose-lg prose-gray max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-6 prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: mockArticle.content }}
              />

              {/* Sidebar - Social Share & Actions */}
              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="flex lg:flex-col gap-4 justify-center">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isLiked
                        ? "border-red-500 bg-red-50 text-red-500"
                        : "border-border hover:border-red-500 hover:bg-red-50 text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Icon icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"} className="text-2xl" />
                    <span className="text-sm font-semibold">{likeCount}</span>
                  </button>

                  {/* Share Buttons */}
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-all">
                    <Icon icon="solar:share-bold" className="text-2xl" />
                    <span className="text-sm font-semibold">Share</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-50 text-muted-foreground hover:text-green-500 transition-all">
                    <Icon icon="solar:bookmark-bold" className="text-2xl" />
                    <span className="text-sm font-semibold">Save</span>
                  </button>
                </div>
              </aside>
            </div>

            {/* Author Bio */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-border">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {mockArticle.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">About {mockArticle.author.name}</h3>
                  <p className="text-muted-foreground mb-4">{mockArticle.author.bio}</p>
                  <div className="flex gap-3">
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Icon icon="solar:link-bold" className="text-xl" />
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Icon icon="solar:letter-bold" className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedArticles.map((article) => (
                <BlogCard key={article.id} {...article} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section - Placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Comments</h2>
            <div className="text-center py-12 bg-muted rounded-2xl border-2 border-dashed border-border">
              <Icon icon="solar:chat-round-line-bold" className="text-6xl text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Comments feature coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">Connect with the database to enable comments.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
