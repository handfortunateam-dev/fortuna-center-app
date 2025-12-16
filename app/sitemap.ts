import { MetadataRoute } from "next";
import { getPodcasts } from "@/services/azurecast/azuracastService";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://www.fortunacenter.com";

    // Static routes
    const routes = [
        "",
        "/about",
        "/blog",
        "/broadcast-live",
        "/demo",
        "/podcast-list",
        "/programs",
        "/video-gallery",
        "/watch",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1.0 : 0.8,
    }));

    let podcastRoutes: MetadataRoute.Sitemap = [];
    try {
        const podcasts = await getPodcasts();
        podcastRoutes = podcasts.map((podcast) => ({
            url: `${baseUrl}/podcast-list/${podcast.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Failed to fetch podcasts for sitemap", error);
    }

    return [...routes, ...podcastRoutes];
}
