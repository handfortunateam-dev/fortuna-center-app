import { MetadataRoute } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema/posts.schema";
import { podcasts } from "@/db/schema/podcast.schema";
import { eq } from "drizzle-orm";

const baseUrl = "https://www.fortunacenter.com";

export default async function imageSitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    const staticImages = [
        { url: `${baseUrl}`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/about`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/blog`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/broadcast-live`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/podcast-list`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/programs`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/programs/broadcast`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/programs/lms`, images: [`${baseUrl}/og-image.png`] },
        { url: `${baseUrl}/video-gallery`, images: [`${baseUrl}/og-image.png`] },
    ];

    for (const staticPage of staticImages) {
        sitemapEntries.push({
            url: staticPage.url,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
            images: staticPage.images,
        });
    }

    try {
        const publishedPosts = await db
            .select({ slug: posts.slug, coverImage: posts.coverImage, updatedAt: posts.updatedAt })
            .from(posts)
            .where(eq(posts.status, "published"));

        for (const post of publishedPosts) {
            const pageUrl = `${baseUrl}/blog/read/${post.slug}`;
            const imageEntries: string[] = [];

            if (post.coverImage) {
                imageEntries.push(post.coverImage);
            }

            sitemapEntries.push({
                url: pageUrl,
                lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.6,
                images: imageEntries,
            });
        }
    } catch {
        // If DB is unavailable during build, skip dynamic pages
    }

    try {
        const publishedPodcasts = await db
            .select({ slug: podcasts.slug, coverImage: podcasts.coverImage, updatedAt: podcasts.updatedAt })
            .from(podcasts)
            .where(eq(podcasts.status, "published"));

        for (const podcast of publishedPodcasts) {
            const pageUrl = `${baseUrl}/podcast-list/${podcast.slug}`;
            const imageEntries: string[] = [];

            if (podcast.coverImage) {
                imageEntries.push(podcast.coverImage);
            }

            sitemapEntries.push({
                url: pageUrl,
                lastModified: podcast.updatedAt ? new Date(podcast.updatedAt) : new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.6,
                images: imageEntries,
            });
        }
    } catch {
        // If DB is unavailable during build, skip dynamic pages
    }

    return sitemapEntries;
}
