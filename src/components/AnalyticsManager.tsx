"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportWebVitals } from "next/web-vitals";
import type { SeoAnalyticsSettings } from "@/types/seo";

const CONSENT_KEY = "portfolio-analytics-consent";
const SESSION_KEY = "portfolio-telemetry-session";

type ConsentState = "unknown" | "granted" | "denied";
type WebVitalMetric = { id: string; name: string; value: number; rating?: "good" | "needs-improvement" | "poor"; navigationType?: string };

type TelemetryPayload = {
  eventType: "page_view" | "web_vital" | "client_error";
  path: string;
  sessionId: string;
  metricName?: string;
  metricValue?: number;
  metricRating?: string;
  metadata?: Record<string, unknown>;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: Record<string, unknown>) => void;
  }
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

async function sendTelemetry(payload: TelemetryPayload): Promise<void> {
  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // Analytics must never interrupt the portfolio experience.
  }
}

function safeReferrerHostname(): string | undefined {
  if (!document.referrer) return undefined;
  try { return new URL(document.referrer).hostname; }
  catch { return undefined; }
}

function consentFromStorage(required: boolean): ConsentState {
  if (!required) return "granted";
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved === "granted" || saved === "denied" ? saved : "unknown";
  } catch {
    return "unknown";
  }
}

export function AnalyticsManager({ settings }: { settings: SeoAnalyticsSettings }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const sessionId = useMemo(() => typeof window === "undefined" ? "" : getSessionId(), []);
  const firstNavigation = useRef(true);

  const dntEnabled = typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1");
  const analyticsConfigured = settings.analyticsProvider !== "none" || settings.collectPageViews || settings.collectWebVitals || settings.collectClientErrors;
  const allowedByPrivacy = !(settings.respectDnt && dntEnabled);
  const publicRoute = !pathname.startsWith("/admin") && !pathname.startsWith("/auth");
  const allowed = publicRoute && analyticsConfigured && allowedByPrivacy && (!settings.consentRequired || consent === "granted");

  useEffect(() => {
    setConsent(consentFromStorage(settings.consentRequired));
    const reset = () => setConsent("unknown");
    window.addEventListener("portfolio:analytics-reset", reset);
    return () => window.removeEventListener("portfolio:analytics-reset", reset);
  }, [settings.consentRequired]);

  const updateConsent = useCallback((value: Exclude<ConsentState, "unknown">) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* no-op */ }
    setConsent(value);
  }, []);

  useEffect(() => {
    if (!allowed || !settings.collectPageViews || !sessionId || pathname.startsWith("/admin")) return;
    const path = `${pathname}${window.location.search}`;
    void sendTelemetry({ eventType: "page_view", path, sessionId, metadata: { referrer: safeReferrerHostname() } });

    if (settings.analyticsProvider === "google" && settings.analyticsMeasurementId && window.gtag) {
      window.gtag("config", settings.analyticsMeasurementId, { page_path: path });
    }
    if (settings.analyticsProvider === "plausible" && settings.analyticsDomain && window.plausible && !firstNavigation.current) {
      window.plausible("pageview", { u: window.location.href });
    }
    firstNavigation.current = false;
  }, [allowed, pathname, sessionId, settings.analyticsDomain, settings.analyticsMeasurementId, settings.analyticsProvider, settings.collectPageViews]);

  useEffect(() => {
    if (!allowed || !settings.collectClientErrors || !sessionId) return;
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; source?: string; stack?: string }>).detail ?? {};
      void sendTelemetry({
        eventType: "client_error",
        path: window.location.pathname,
        sessionId,
        metadata: {
          message: String(detail.message ?? "Unknown client error").slice(0, 500),
          source: String(detail.source ?? "client").slice(0, 120),
          stack: String(detail.stack ?? "").slice(0, 1500),
        },
      });
    };
    window.addEventListener("portfolio:client-error", listener);
    return () => window.removeEventListener("portfolio:client-error", listener);
  }, [allowed, sessionId, settings.collectClientErrors]);

  const reportMetric = useCallback((metric: WebVitalMetric) => {
    if (!allowed || !settings.collectWebVitals || !sessionId || pathname.startsWith("/admin")) return;
    void sendTelemetry({
      eventType: "web_vital",
      path: pathname,
      sessionId,
      metricName: metric.name,
      metricValue: metric.value,
      metricRating: metric.rating,
      metadata: { id: metric.id, navigationType: metric.navigationType },
    });
  }, [allowed, pathname, sessionId, settings.collectWebVitals]);

  useReportWebVitals(reportMetric);

  const showConsent = publicRoute && analyticsConfigured && settings.consentRequired && allowedByPrivacy && consent === "unknown";

  return (
    <>
      {allowed && settings.analyticsProvider === "google" && settings.analyticsMeasurementId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.analyticsMeasurementId)}`} strategy="afterInteractive" />
          <Script id="portfolio-google-analytics" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${settings.analyticsMeasurementId}', { anonymize_ip: true, page_path: window.location.pathname + window.location.search });
          `}</Script>
        </>
      ) : null}

      {allowed && settings.analyticsProvider === "plausible" && settings.analyticsDomain ? (
        <Script
          src="https://plausible.io/js/script.js"
          data-domain={settings.analyticsDomain}
          strategy="afterInteractive"
          defer
        />
      ) : null}

      {showConsent ? (
        <section className="analytics-consent" role="dialog" aria-label="Analytics preference" aria-live="polite">
          <div>
            <strong>Privacy-friendly analytics</strong>
            <p>Allow anonymous usage and performance measurements to help improve this portfolio. No advertising profile is created.</p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="button button-secondary" onClick={() => updateConsent("denied")}>Necessary only</button>
            <button type="button" className="button button-primary" onClick={() => updateConsent("granted")}>Allow analytics</button>
          </div>
        </section>
      ) : null}
    </>
  );
}
