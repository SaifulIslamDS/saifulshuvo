import type { MetadataRoute } from "next";
import { getPostTaxonomies, getPublicPosts } from "@/lib/posts/queries";
import { getPublicProjects } from "@/lib/projects/queries";
import { getSiteUrl } from "@/lib/supabase/env";
import { getSeoAnalyticsSettings } from "@/lib/seo/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [settings, projects, postResult, taxonomies] = await Promise.all([
    getSeoAnalyticsSettings(false),
    getPublicProjects(),
    getPublicPosts({ pageSize: 1000 }),
    getPostTaxonomies(),
  ]);
  if (!settings.indexSite) return [];
  const staticRoutes = ["", "/projects", "/blog", "/contact", "/privacy"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.8 })),
    ...projects.map((project) => ({ url: `${baseUrl}/projects/${project.slug}`, lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...postResult.posts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: "monthly" as const, priority: 0.75 })),
    ...taxonomies.categories.map((category) => ({ url: `${baseUrl}/blog/category/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...taxonomies.tags.map((tag) => ({ url: `${baseUrl}/blog/tag/${tag.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
