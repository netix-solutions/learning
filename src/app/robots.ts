import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep crawlers out of logged-in areas, auth plumbing, and API routes.
      disallow: [
        "/admin",
        "/parent",
        "/home",
        "/home-preview",
        "/practice",
        "/shop",
        "/api/",
        "/auth/",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: "https://summersharp.app/sitemap.xml",
  };
}
