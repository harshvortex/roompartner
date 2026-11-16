import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth callback, API and payment endpoints are not for crawlers.
        disallow: ["/api/", "/auth/", "/login", "/chats", "/dashboard", "/my-space"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
