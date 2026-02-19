import type { Metadata } from "next";
import type { ReactNode } from "react";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [post] = await db
      .select({
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!post) {
      return { title: "Article Not Found" };
    }

    const description =
      post.excerpt ||
      `Read the article "${post.title}" on the Fortuna Center Kupang blog.`;

    return {
      title: post.title,
      description,
      alternates: {
        canonical: `https://www.fortunacenter.com/blog/read/${slug}`,
      },
      openGraph: {
        title: post.title,
        description,
        url: `https://www.fortunacenter.com/blog/read/${slug}`,
        type: "article",
        images: post.coverImage
          ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  } catch {
    return { title: "Blog | Fortuna Center Kupang" };
  }
}

export default function BlogDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
