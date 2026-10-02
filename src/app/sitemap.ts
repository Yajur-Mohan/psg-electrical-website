import type { MetadataRoute } from "next";

const base = process.env.SITE_URL ?? "http://localhost:3000";
const routes = ["", "/about", "/services", "/projects", "/trite-solar", "/partners", "/faq", "/contact", "/quote", "/privacy", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `${base}${r}`, changeFrequency: "monthly", priority: r === "" ? 1 : 0.7 }));
}
