import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/dashboard/",
                "/teachers/",
                "/students/",
                "/classes/",
                "/teacher-classes/",
                "/class-enrollments/",
                "/courses/",
                "/assignments/",
                "/podcasts/",
                "/billing/",
                "/broadcasts/",
                "/sign-in/",
                "/sign-up/",
                "/user-profile/",
                "/v1/",
            ],
        },
        sitemap: [
            "https://www.fortunacenter.com/sitemap.xml",
            "https://www.fortunacenter.com/image-sitemap.xml",
        ],
    };
}
