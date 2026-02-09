"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, use, useCallback, useRef } from "react";
import RelatedArticles from "@/features/public/read/post/RelatedArticles";
import CommentsSection from "@/features/public/read/post/CommentsSection";
import {
  useBlogPostBySlug,
  useBlogPosts,
  useToggleLike,
  useCheckLikeStatus,
} from "@/services/blogService";
import { ShareInline } from "@/components/share-button/ShareInline";
import Confetti from "@/components/confetti";
import { Spinner } from "@heroui/react";
import { notFound } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug);
  const { data: relatedPosts = [] } = useBlogPosts({ status: "published" });

  // Visitor ID for like tracking (anonymous users)
  const [visitorId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("blog-visitor-id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("blog-visitor-id", id);
    }
    return id;
  });

  const toggleLikeMutation = useToggleLike();
  const { data: likeStatus } = useCheckLikeStatus(post?.id, visitorId);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(
    null,
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPos, setConfettiPos] = useState({ x: 0.5, y: 0.5 });
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  const isLiked = optimisticLiked ?? likeStatus?.liked ?? false;

  const handleLike = useCallback(() => {
    if (!visitorId || !post) return;

    // Optimistic update
    const newLiked = !isLiked;
    const currentCount = optimisticLikeCount ?? (post.likeCount || 0);
    setOptimisticLiked(newLiked);
    setOptimisticLikeCount(
      newLiked ? currentCount + 1 : Math.max(currentCount - 1, 0),
    );

    // Confetti burst on like
    if (newLiked) {
      // Get button position for boom origin
      if (likeButtonRef.current) {
        const rect = likeButtonRef.current.getBoundingClientRect();
        setConfettiPos({
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        });
      }
      setShowConfetti(true);
    }

    toggleLikeMutation.mutate(
      { postId: post.id, visitorId },
      {
        onSuccess: (data) => {
          setOptimisticLiked(data.liked);
          setOptimisticLikeCount(data.likeCount);
        },
        onError: () => {
          // Revert optimistic update
          setOptimisticLiked(null);
          setOptimisticLikeCount(null);
        },
      },
    );
  }, [visitorId, post, isLiked, optimisticLikeCount, toggleLikeMutation]);

  const article = useMemo(() => {
    if (!post) return null;
    return {
      ...post,
      author: {
        name: post.author.name || "Admin",
        image: post.author.image || undefined,
        bio: "Content Creator at Fortuna Center", // Placeholder bio
      },
      categories: post.categories.map((c) => ({
        name: c.name,
        slug: c.slug,
      })),
      tags: post.tags?.map((t) => t.tag.name) || [],
      readTime: Math.ceil(post.content.split(" ").length / 200) || 5,
    };
  }, [post]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return relatedPosts
      .filter((p) => p.id !== article.id)
      .slice(0, 2)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || "",
        coverImage: p.coverImage || undefined,
        author: {
          name: p.author.name || "Admin",
          image: p.author.image || undefined,
        },
        publishedAt: new Date(p.publishedAt || p.createdAt),
        readTime: Math.ceil(p.content.split(" ").length / 200) || 5,
        categories: p.categories.map((c) => ({
          name: c.name,
          slug: c.slug,
        })),
        viewCount: p.viewCount,
        likeCount: p.likeCount,
      }));
  }, [relatedPosts, article]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" color="primary" label="Loading article..." />
      </div>
    );
  }

  if (isError || (!post && !isLoading)) {
    notFound();
  }

  // Ensure article exists before rendering (notFound handles the redirect/error page, but TS needs a guard or return)
  if (!article) return null;

  const currentLikeCount = optimisticLikeCount ?? (article.likeCount || 0);

  const formattedDate = new Date(
    article.publishedAt || article.createdAt,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Like Confetti - boom from button */}
      {showConfetti && (
        <Confetti
          mode="boom"
          x={confettiPos.x}
          y={confettiPos.y}
          particleCount={100}
          deg={270}
          spreadDeg={80}
          shapeSize={16}
          launchSpeed={2.5}
          gravity={0.06}
          friction={0.97}
          opacityDeltaMultiplier={0.6}
          effectCount={2}
          effectInterval={150}
          colors={[
            "#ef4444",
            "#f97316",
            "#eab308",
            "#ec4899",
            "#a855f7",
            "#3b82f6",
            "#22c55e",
            "#06b6d4",
          ]}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Icon icon="solar:alt-arrow-right-linear" />
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <Icon icon="solar:alt-arrow-right-linear" />
            <span className="text-foreground font-medium">
              {article.categories[0]?.name || "Article"}
            </span>
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
              {article.categories.length > 0 && (
                <Link
                  href={`/blog?category=${article.categories[0].slug}`}
                  className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold mb-6 hover:bg-red-700 transition-colors"
                >
                  {article.categories[0].name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                    {article.author.image ? (
                      <Image
                        src={article.author.image}
                        alt={article.author.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      article.author.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {article.author.name}
                    </div>
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
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:eye-bold" className="text-xl" />
                  <span>{article.viewCount} views</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag: string) => (
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
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Icon
                    icon="solar:gallery-bold"
                    className="text-9xl text-muted-foreground"
                  />
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
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Inline Action Bar */}
            <div className="flex items-center gap-3 mt-10 py-4 border-t border-b border-border/40">
              {/* Like */}
              <button
                ref={likeButtonRef}
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  isLiked
                    ? "bg-red-50 text-red-500"
                    : "hover:bg-muted text-muted-foreground hover:text-red-500"
                }`}
              >
                <Icon
                  icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
                  className="text-base"
                />
                <span className="font-medium">{currentLikeCount}</span>
              </button>

              <div className="w-px h-4 bg-border/60" />

              {/* Share - expands horizontally on click */}
              <ShareInline
                url={`/blog/read/${article.slug}`}
                title={article.title}
                direction="horizontal"
                size="sm"
              />
            </div>

            {/* Author Bio */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-border">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden">
                  {article.author.image ? (
                    <Image
                      src={article.author.image}
                      alt={article.author.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    article.author.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    About {article.author.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {article.author.bio}
                  </p>
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

      <RelatedArticles articles={relatedArticles} />
      <CommentsSection postId={article.id} />
    </div>
  );
}
