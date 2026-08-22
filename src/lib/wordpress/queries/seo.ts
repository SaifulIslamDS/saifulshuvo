import { cache } from "react";
import { choice, mediaNode, numberValue, text } from "@/lib/wordpress/helpers";
import { mapWordPressMedia } from "@/lib/wordpress/media-mapper";
import { getSiteSettingsFields } from "@/lib/wordpress/queries/site-settings";
import type { AnalyticsProvider, SeoAnalyticsSettings } from "@/types/seo";

const fallback: SeoAnalyticsSettings = {
  defaultTitle: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
  titleTemplate: "%s | Saiful Islam",
  defaultDescription: "Portfolio of Saiful Islam, a data analyst, web developer and SaaS builder creating dashboards, business applications and practical AI-assisted solutions.",
  keywords: [],
  indexSite: true,
  analyticsProvider: "none",
  consentRequired: true,
  respectDnt: true,
  collectPageViews: false,
  collectWebVitals: false,
  collectClientErrors: false,
  retentionDays: 90,
};

function provider(value: unknown): AnalyticsProvider {
  const candidate = choice(value, "none");
  return candidate === "google" || candidate === "plausible" ? candidate : "none";
}

export const getSeoAnalyticsSettings = cache(async (_includePrivate = false): Promise<SeoAnalyticsSettings> => {
  const fields = await getSiteSettingsFields();
  const og = mapWordPressMedia(mediaNode(fields.defaultOgImage), "general");
  const keywords = Array.isArray(fields.seoKeywords)
    ? fields.seoKeywords.map((item) => text(item.keyword)).filter(Boolean)
    : [];
  return {
    defaultTitle: text(fields.seoDefaultTitle, fallback.defaultTitle),
    titleTemplate: text(fields.seoTitleTemplate, fallback.titleTemplate),
    defaultDescription: text(fields.seoDescription, fallback.defaultDescription),
    keywords,
    ogImageAssetId: og?.id,
    ogImageUrl: og?.publicUrl,
    ogImageAlt: og?.altText,
    twitterHandle: text(fields.twitterHandle) || undefined,
    indexSite: fields.indexSite ?? fallback.indexSite,
    googleSiteVerification: text(fields.googleSiteVerification) || undefined,
    bingSiteVerification: text(fields.bingSiteVerification) || undefined,
    analyticsProvider: provider(fields.analyticsProvider),
    analyticsMeasurementId: text(fields.analyticsMeasurementId) || undefined,
    analyticsDomain: text(fields.analyticsDomain) || undefined,
    consentRequired: fields.analyticsConsentRequired ?? fallback.consentRequired,
    respectDnt: fields.analyticsRespectDnt ?? fallback.respectDnt,
    collectPageViews: fields.analyticsCollectPageViews ?? fallback.collectPageViews,
    collectWebVitals: fields.analyticsCollectWebVitals ?? fallback.collectWebVitals,
    collectClientErrors: fields.analyticsCollectClientErrors ?? fallback.collectClientErrors,
    retentionDays: numberValue(fields.analyticsRetentionDays, fallback.retentionDays),
  };
});
