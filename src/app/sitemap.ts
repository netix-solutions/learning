import type { MetadataRoute } from "next";

const BASE = "https://summersharp.app";

// Public marketing + entry pages only. Everything behind a login (parent
// dashboard, kid home, practice, admin) is excluded here and disallowed in
// robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE}/pricing`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/signup`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/login`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/kids`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/privacy`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE}/terms`, priority: 0.2, changeFrequency: "yearly" },
  ];
}
