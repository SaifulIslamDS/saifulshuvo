import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/lib/projects/queries";
import { getSiteUrl } from "@/lib/supabase/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const projects = await getPublicProjects();
  const staticRoutes = ["", "/projects", "/blog", "/contact"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.8 })),
    ...projects.map((project) => ({ url: `${baseUrl}/projects/${project.slug}`, lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
