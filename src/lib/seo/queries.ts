import { cache } from "react";
import { getMediaAssetById } from "@/lib/media/queries";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsDashboard,
  SeoAnalyticsSettings,
  TelemetryEvent,
  WebVitalSummary,
} from "@/types/seo";

const fallbackSettings: SeoAnalyticsSettings = {
  defaultTitle: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
  titleTemplate: "%s | Saiful Islam",
  defaultDescription:
    "Portfolio of Saiful Islam, a data analyst, web developer and SaaS builder creating dashboards, business applications and practical AI-assisted solutions.",
  keywords: [
    "Saiful Islam",
    "Data Analyst Bangladesh",
    "Power BI Developer",
    "Python Data Analyst",
    "SQL Analyst",
    "Next.js Developer",
    "SaaS Builder",
    "Remote Data Analyst",
  ],
  indexSite: true,
  analyticsProvider: "none",
  consentRequired: true,
  respectDnt: true,
  collectPageViews: true,
  collectWebVitals: true,
  collectClientErrors: true,
  retentionDays: 90,
};

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function boolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function number(value: unknown, fallback: number): number {
  const candidate = Number(value);
  return Number.isFinite(candidate) ? candidate : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];
}

export const getSeoAnalyticsSettings = cache(async function getSeoAnalyticsSettings(includeOgImage = true): Promise<SeoAnalyticsSettings> {
  if (!hasSupabasePublicConfig()) return fallbackSettings;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(`
      seo_default_title,
      seo_title_template,
      seo_default_description,
      seo_keywords,
      seo_og_image_asset_id,
      seo_twitter_handle,
      seo_index_site,
      seo_google_site_verification,
      seo_bing_site_verification,
      analytics_provider,
      analytics_measurement_id,
      analytics_domain,
      analytics_consent_required,
      analytics_respect_dnt,
      analytics_collect_page_views,
      analytics_collect_web_vitals,
      analytics_collect_client_errors,
      analytics_retention_days
    `)
    .eq("id", "primary")
    .maybeSingle();

  if (error || !data) return fallbackSettings;

  const provider = data.analytics_provider === "google" || data.analytics_provider === "plausible"
    ? data.analytics_provider
    : "none";
  const ogImageAssetId = text(data.seo_og_image_asset_id);
  const ogImage = includeOgImage ? await getMediaAssetById(ogImageAssetId) : null;

  return {
    defaultTitle: text(data.seo_default_title) ?? fallbackSettings.defaultTitle,
    titleTemplate: text(data.seo_title_template) ?? fallbackSettings.titleTemplate,
    defaultDescription: text(data.seo_default_description) ?? fallbackSettings.defaultDescription,
    keywords: stringArray(data.seo_keywords).length ? stringArray(data.seo_keywords) : fallbackSettings.keywords,
    ogImageAssetId,
    ogImageUrl: ogImage?.publicUrl,
    ogImageAlt: ogImage?.altText,
    twitterHandle: text(data.seo_twitter_handle),
    indexSite: boolean(data.seo_index_site, true),
    googleSiteVerification: text(data.seo_google_site_verification),
    bingSiteVerification: text(data.seo_bing_site_verification),
    analyticsProvider: provider,
    analyticsMeasurementId: text(data.analytics_measurement_id),
    analyticsDomain: text(data.analytics_domain),
    consentRequired: boolean(data.analytics_consent_required, true),
    respectDnt: boolean(data.analytics_respect_dnt, true),
    collectPageViews: boolean(data.analytics_collect_page_views, true),
    collectWebVitals: boolean(data.analytics_collect_web_vitals, true),
    collectClientErrors: boolean(data.analytics_collect_client_errors, true),
    retentionDays: Math.min(730, Math.max(7, number(data.analytics_retention_days, 90))),
  };
});

function mapTelemetry(row: Record<string, unknown>): TelemetryEvent {
  const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
    ? row.metadata as Record<string, unknown>
    : {};
  return {
    id: String(row.id ?? ""),
    eventType: row.event_type === "web_vital" || row.event_type === "client_error" ? row.event_type : "page_view",
    path: String(row.path ?? "/"),
    metricName: text(row.metric_name),
    metricValue: row.metric_value == null ? undefined : Number(row.metric_value),
    metricRating: row.metric_rating === "good" || row.metric_rating === "needs-improvement" || row.metric_rating === "poor"
      ? row.metric_rating
      : undefined,
    metadata,
    occurredAt: String(row.occurred_at ?? new Date(0).toISOString()),
  };
}

export async function getAnalyticsDashboard(periodDays = 30): Promise<AnalyticsDashboard> {
  const safeDays = Math.min(365, Math.max(1, Math.trunc(periodDays)));
  if (!hasSupabasePublicConfig()) {
    return { periodDays: safeDays, pageViews: 0, uniqueSessions: 0, clientErrors: 0, topPaths: [], webVitals: [], recentErrors: [] };
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - safeDays * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("telemetry_events")
    .select("id,event_type,path,session_hash,metric_name,metric_value,metric_rating,metadata,occurred_at")
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(5000);

  if (error) throw new Error(`Unable to load analytics: ${error.message}`);
  const rows = (data ?? []) as Record<string, unknown>[];
  const events = rows.map(mapTelemetry);
  const pageViews = rows.filter((row) => row.event_type === "page_view");
  const sessions = new Set(pageViews.map((row) => String(row.session_hash ?? "")).filter(Boolean));
  const pathCounts = new Map<string, number>();
  for (const row of pageViews) {
    const path = String(row.path ?? "/");
    pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
  }

  const vitalMap = new Map<string, { values: number[]; good: number; needs: number; poor: number }>();
  for (const event of events) {
    if (event.eventType !== "web_vital" || !event.metricName || event.metricValue == null) continue;
    const current = vitalMap.get(event.metricName) ?? { values: [], good: 0, needs: 0, poor: 0 };
    current.values.push(event.metricValue);
    if (event.metricRating === "good") current.good += 1;
    if (event.metricRating === "needs-improvement") current.needs += 1;
    if (event.metricRating === "poor") current.poor += 1;
    vitalMap.set(event.metricName, current);
  }

  const webVitals: WebVitalSummary[] = [...vitalMap.entries()].map(([name, item]) => ({
    name,
    samples: item.values.length,
    average: item.values.reduce((sum, value) => sum + value, 0) / Math.max(1, item.values.length),
    good: item.good,
    needsImprovement: item.needs,
    poor: item.poor,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return {
    periodDays: safeDays,
    pageViews: pageViews.length,
    uniqueSessions: sessions.size,
    clientErrors: events.filter((event) => event.eventType === "client_error").length,
    topPaths: [...pathCounts.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 12),
    webVitals,
    recentErrors: events.filter((event) => event.eventType === "client_error").slice(0, 20),
    oldestEventAt: events.at(-1)?.occurredAt,
    newestEventAt: events[0]?.occurredAt,
  };
}

export { fallbackSettings as fallbackSeoAnalyticsSettings };
