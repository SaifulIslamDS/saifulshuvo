import type { MetadataRoute } from "next";
import { getSeoAnalyticsSettings } from "@/lib/seo/queries";
import { getSiteUrl } from "@/lib/supabase/env";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [settings, siteUrl] = await Promise.all([getSeoAnalyticsSettings(false), Promise.resolve(getSiteUrl())]);
  if (!settings.indexSite) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/auth/", "/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
