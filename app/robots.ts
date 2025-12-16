import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/analytics/",
                "/azuracast/",
                "/class-enrollments/",
                "/classes/",
                "/dashboard/",
                "/sessions/",
                "/settings/",
                "/teacher-classes/",
                "/users/",
                "/youtube-integration/",
                "/assignments-for-classes/",
                "/classes-list/",
                "/dashboard-teacher/",
                "/student/",
                "/administrative/",
            ],
        },
        sitemap: "https://www.fortunacenter.com/sitemap.xml",
    };
}
