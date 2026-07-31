export type AnalyticsProvider = "none" | "google" | "plausible";

export type SeoAnalyticsSettings = {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImageAssetId?: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  twitterHandle?: string;
  indexSite: boolean;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  analyticsProvider: AnalyticsProvider;
  analyticsMeasurementId?: string;
  analyticsDomain?: string;
  consentRequired: boolean;
  respectDnt: boolean;
  collectPageViews: boolean;
  collectWebVitals: boolean;
  collectClientErrors: boolean;
  retentionDays: number;
};

export type TelemetryEvent = {
  id: string;
  eventType: "page_view" | "web_vital" | "client_error";
  path: string;
  metricName?: string;
  metricValue?: number;
  metricRating?: "good" | "needs-improvement" | "poor";
  metadata: Record<string, unknown>;
  occurredAt: string;
};

export type AnalyticsPathSummary = { path: string; views: number };
export type WebVitalSummary = {
  name: string;
  samples: number;
  average: number;
  good: number;
  needsImprovement: number;
  poor: number;
};

export type AnalyticsDashboard = {
  periodDays: number;
  pageViews: number;
  uniqueSessions: number;
  clientErrors: number;
  topPaths: AnalyticsPathSummary[];
  webVitals: WebVitalSummary[];
  recentErrors: TelemetryEvent[];
  oldestEventAt?: string;
  newestEventAt?: string;
};
