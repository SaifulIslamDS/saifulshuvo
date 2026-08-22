"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { postWordPressRest } from "@/lib/wordpress/rest";
import type { SeoAnalyticsSettings } from "@/types/seo";

const CONSENT_KEY = "portfolio-analytics-consent";
const SESSION_KEY = "portfolio-telemetry-session";

type ConsentState = "unknown" | "granted" | "denied";
type WebVitalMetric = { id: string; name: string; value: number; rating?: "good" | "needs-improvement" | "poor"; navigationType?: string };

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

async function sendAnalytics(payload: { event: string; path: string; sessionId: string; referrer?: string; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    await postWordPressRest("/analytics", {
      event: payload.event,
      path: payload.path,
      session_id: payload.sessionId,
      referrer: payload.referrer || "",
      metadata: payload.metadata || {},
    });
  } catch {
    // Analytics must never interrupt the portfolio experience.
  }
}

async function sendWebVital(payload: { name: string; value: number; rating?: string; path: string; sessionId: string; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    await postWordPressRest("/web-vitals", {
      name: payload.name,
      value: payload.value,
      rating: payload.rating || "",
      path: payload.path,
      session_id: payload.sessionId,
      metadata: payload.metadata || {},
    });
  } catch {
    // Web Vital collection is best effort.
  }
}

async function sendClientError(payload: { message: string; source: string; stack?: string; path: string; sessionId: string }): Promise<void> {
  try {
    await postWordPressRest("/errors", {
      type: payload.source || "client_error",
      message: payload.message,
      path: payload.path,
      stack: payload.stack || "",
      session_id: payload.sessionId,
      metadata: { source: payload.source },
    });
  } catch {
    // Error telemetry must never cause another user-facing error.
  }
}

function safeReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  try { return new URL(document.referrer).toString().slice(0, 500); }
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

  const dntEnabled =
    typeof navigator !== "undefined" &&
    (navigator.doNotTrack === "1" ||
      (typeof window !== "undefined" &&
        (window as unknown as { doNotTrack?: string }).doNotTrack === "1"));
  const analyticsConfigured = settings.analyticsProvider !== "none" || settings.collectPageViews || settings.collectWebVitals || settings.collectClientErrors;
  const allowedByPrivacy = !(settings.respectDnt && dntEnabled);
  const allowed = analyticsConfigured && allowedByPrivacy && (!settings.consentRequired || consent === "granted");

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
    if (!allowed || !settings.collectPageViews || !sessionId) return;
    const path = `${pathname}${window.location.search}`;
    void sendAnalytics({ event: "page_view", path, sessionId, referrer: safeReferrer(), metadata: {} });

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
      void sendClientError({
        message: String(detail.message ?? "Unknown client error").slice(0, 500),
        source: String(detail.source ?? "client").slice(0, 120),
        stack: String(detail.stack ?? "").slice(0, 1500),
        path: window.location.pathname,
        sessionId,
      });
    };
    window.addEventListener("portfolio:client-error", listener);
    return () => window.removeEventListener("portfolio:client-error", listener);
  }, [allowed, sessionId, settings.collectClientErrors]);

  const reportMetric = useCallback((metric: WebVitalMetric) => {
    if (!allowed || !settings.collectWebVitals || !sessionId) return;
    void sendWebVital({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: pathname,
      sessionId,
      metadata: { id: metric.id, navigationType: metric.navigationType },
    });
  }, [allowed, pathname, sessionId, settings.collectWebVitals]);

  useReportWebVitals(reportMetric);

  const showConsent = analyticsConfigured && settings.consentRequired && allowedByPrivacy && consent === "unknown";

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
