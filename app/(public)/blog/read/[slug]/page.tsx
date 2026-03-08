import type { Metadata, ResolvingMetadata } from "next";
import { db } from "@/db";
import { posts as postsTable } from "@/db/schema/posts.schema";
import { eq } from "drizzle-orm";
import BlogPostClient from "./BlogPostClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(postsTable.slug, slug),
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `https://www.fortunacenter.com/blog/read/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://www.fortunacenter.com/blog/read/${slug}`,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
