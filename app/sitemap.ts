import type { MetadataRoute } from "next";

const ROUTES = [
  "",
  "/flatmates",
  "/rooms",
  "/rentals",
  "/squads",
  "/chats",
  "/dashboard",
  "/my-space",
  "/onboarding",
  "/list-room",
  "/list-item",
  "/login",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
