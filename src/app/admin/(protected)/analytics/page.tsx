import Link from "next/link";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { Icon } from "@/components/Icon";
import { getAnalyticsDashboard, getSeoAnalyticsSettings } from "@/lib/seo/queries";
import { purgeExpiredTelemetryAction } from "./actions";

type Props = { searchParams: Promise<{ days?: string; success?: string; error?: string }> };

function metricValue(name: string, value: number): string {
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const query = await searchParams;
  const days = Math.min(365, Math.max(1, Number.parseInt(query.days ?? "30", 10) || 30));
  const [dashboard, settings] = await Promise.all([getAnalyticsDashboard(days), getSeoAnalyticsSettings(false)]);
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">First-party observability</span><h1>Analytics & performance</h1><p>Review anonymous traffic, Core Web Vitals and bounded client errors stored in your own Supabase project.</p></div><Link className="button button-secondary" href="/admin/seo"><Icon name="settings" size={17}/> Configure tracking</Link></div>
      <AdminFlash success={query.success} error={query.error}/>

      <div className="analytics-filter-row"><span>Reporting window</span>{[7,30,90,365].map((period) => <Link key={period} className={period === days ? "active" : ""} href={`/admin/analytics?days=${period}`}>{period} days</Link>)}</div>
      <div className="admin-stat-grid analytics-stat-grid">
        <article><Icon name="eye"/><span>Page views</span><strong>{dashboard.pageViews}</strong><small>Consent-aware first-party events</small></article>
        <article><Icon name="user"/><span>Anonymous sessions</span><strong>{dashboard.uniqueSessions}</strong><small>Server-hashed session IDs</small></article>
        <article><Icon name="alert"/><span>Client errors</span><strong>{dashboard.clientErrors}</strong><small>Bounded browser error reports</small></article>
        <article><Icon name="database"/><span>Retention</span><strong>{settings.retentionDays}d</strong><small>{settings.analyticsProvider} provider</small></article>
      </div>

      <div className="analytics-dashboard-grid">
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Audience paths</span><h2>Top pages</h2></div><span>{dashboard.topPaths.length} paths</span></div>{dashboard.topPaths.length ? <div className="analytics-table">{dashboard.topPaths.map((item) => <div key={item.path}><code>{item.path}</code><strong>{item.views}</strong></div>)}</div> : <div className="empty-state"><Icon name="chart" size={32}/><h3>No page views yet</h3><p>Events appear after visitors grant consent or consent is disabled.</p></div>}</section>

        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">User experience</span><h2>Core Web Vitals</h2></div><span>{dashboard.webVitals.reduce((sum, item) => sum + item.samples, 0)} samples</span></div>{dashboard.webVitals.length ? <div className="vitals-grid">{dashboard.webVitals.map((metric) => <article key={metric.name}><div><strong>{metric.name}</strong><span>{metricValue(metric.name, metric.average)}</span></div><small>{metric.samples} samples</small><div className="vital-ratings"><i className="good" style={{ width: `${metric.samples ? metric.good / metric.samples * 100 : 0}%` }}/><i className="needs" style={{ width: `${metric.samples ? metric.needsImprovement / metric.samples * 100 : 0}%` }}/><i className="poor" style={{ width: `${metric.samples ? metric.poor / metric.samples * 100 : 0}%` }}/></div></article>)}</div> : <div className="empty-state"><Icon name="spark" size={32}/><h3>No Web Vital samples</h3><p>Enable Web Vitals collection and visit public pages from a production build.</p></div>}</section>
      </div>

      <section className="admin-panel analytics-errors-panel"><div className="panel-head"><div><span className="eyebrow">Runtime resilience</span><h2>Recent client errors</h2></div><span>{dashboard.recentErrors.length} shown</span></div>{dashboard.recentErrors.length ? <div className="analytics-error-list">{dashboard.recentErrors.map((event) => <article key={event.id}><div><code>{event.path}</code><time>{new Date(event.occurredAt).toLocaleString("en-GB")}</time></div><strong>{String(event.metadata.message ?? "Unknown client error")}</strong><small>{String(event.metadata.source ?? "client")}</small></article>)}</div> : <div className="empty-state compact-empty"><Icon name="shield" size={32}/><h3>No client errors recorded</h3><p>That is a healthy signal, not a missing feature.</p></div>}</section>

      <section className="admin-panel retention-panel"><div><span className="eyebrow">Data minimisation</span><h2>Retention cleanup</h2><p>Delete events older than the configured {settings.retentionDays}-day retention window. This does not change audit events or contact messages.</p></div><form action={purgeExpiredTelemetryAction}><ConfirmSubmitButton className="button button-danger" message="Delete all telemetry older than the configured retention period?">Purge expired telemetry</ConfirmSubmitButton></form></section>
    </>
  );
}
