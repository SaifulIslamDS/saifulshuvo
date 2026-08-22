import type { MetadataRoute } from "next";
import { getSeoAnalyticsSettings } from "@/lib/wordpress/queries/seo";
import { getSiteUrl } from "@/lib/wordpress/env";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [settings, siteUrl] = await Promise.all([getSeoAnalyticsSettings(false), Promise.resolve(getSiteUrl())]);
  if (!settings.indexSite) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
