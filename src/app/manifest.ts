import type { MetadataRoute } from "next";

// Web App Manifest (served by Next at /manifest.webmanifest and auto-linked).
// Makes SunSharp installable to the home screen with a standalone, app-like UI.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SunSharp — Summer Learning",
    short_name: "SunSharp",
    description:
      "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, build your own world of rewards.",
    id: "/",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fff9ef",
    theme_color: "#fff9ef",
    categories: ["education", "kids"],
    shortcuts: [
      { name: "Practice quizzes", short_name: "Practice", url: "/practice/daily" },
      { name: "My rewards", short_name: "Rewards", url: "/rewards" },
    ],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
