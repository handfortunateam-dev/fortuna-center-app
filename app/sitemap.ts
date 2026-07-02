import { MetadataRoute } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

const baseUrl = "https://www.fortunacenter.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static public pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/broadcast-live`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/podcast-list`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/programs`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/programs/broadcast`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/programs/lms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/video-gallery`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/video-gallery/videos`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
    ];

    // Dynamic blog post pages
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const publishedPosts = await db
            .select({ slug: posts.slug, updatedAt: posts.updatedAt })
            .from(posts)
            .where(eq(posts.status, "published"));

        blogPages = publishedPosts.map((post) => ({
            url: `${baseUrl}/blog/read/${post.slug}`,
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));
    } catch {
        // If DB is unavailable during build, skip dynamic pages
    }

    return [...staticPages, ...blogPages];
}
