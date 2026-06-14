import type { MetadataRoute } from "next";

// Web App Manifest (served by Next at /manifest.webmanifest and auto-linked).
// Makes SummerSharp installable to the home screen with a standalone, app-like UI.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SummerSharp — Summer Learning",
    short_name: "SummerSharp",
    description:
      "A fun summer learning app for Florida K–5 students. Practice math and reading, earn points, build daily streaks, and unlock badges.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fef6ff",
    theme_color: "#fef6ff",
    categories: ["education", "kids"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
