import type { MetadataRoute } from "next";
import { getAllPublicPosts, getPostTaxonomies } from "@/lib/wordpress/queries/posts";
import { getPublicProjects } from "@/lib/wordpress/queries/projects";
import { getSiteUrl } from "@/lib/wordpress/env";
import { getSeoAnalyticsSettings } from "@/lib/wordpress/queries/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [settings, projects, posts, taxonomies] = await Promise.all([getSeoAnalyticsSettings(false), getPublicProjects(), getAllPublicPosts(), getPostTaxonomies()]);
  if (!settings.indexSite) return [];
  const staticRoutes = ["", "/projects", "/blog", "/contact", "/privacy"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.8 })),
    ...projects.map((project) => ({ url: `${baseUrl}/projects/${project.slug}`, lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(), changeFrequency: "monthly" as const, priority: 0.75 })),
    ...taxonomies.categories.map((category) => ({ url: `${baseUrl}/blog/category/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...taxonomies.tags.map((tag) => ({ url: `${baseUrl}/blog/tag/${tag.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
