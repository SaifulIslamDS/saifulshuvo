import { AdminFlash } from "@/components/admin/AdminFlash";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Icon } from "@/components/Icon";
import { getAdminImageAssets } from "@/lib/media/queries";
import { getSeoAnalyticsSettings } from "@/lib/seo/queries";
import { updateAnalyticsSettingsAction, updateSeoSettingsAction } from "./actions";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function SeoSettingsPage({ searchParams }: Props) {
  const [query, settings, images] = await Promise.all([searchParams, getSeoAnalyticsSettings(), getAdminImageAssets()]);
  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Search and measurement</span><h1>SEO & analytics settings</h1><p>Control default search metadata, indexing, verification, privacy consent and optional analytics providers.</p></div>
        <a className="button button-secondary" href="/sitemap.xml" target="_blank" rel="noreferrer">Open sitemap <Icon name="external" size={17}/></a>
      </div>
      <AdminFlash success={query.success} error={query.error}/>

      <div className="seo-settings-grid">
        <form action={updateSeoSettingsAction} className="admin-panel project-form-section">
          <div className="panel-head"><div><span className="eyebrow">Organic discovery</span><h2>Search defaults</h2></div><span>{settings.indexSite ? "Indexing enabled" : "Noindex enabled"}</span></div>
          <label>Default site title<input name="seo_default_title" required minLength={20} maxLength={120} defaultValue={settings.defaultTitle}/></label>
          <label>Page title template<input name="seo_title_template" required defaultValue={settings.titleTemplate}/><small>Keep <code>%s</code> where the page title should appear.</small></label>
          <label>Default meta description<textarea name="seo_default_description" required minLength={50} maxLength={320} rows={5} defaultValue={settings.defaultDescription}/></label>
          <label>Keywords — comma or line separated<textarea name="seo_keywords" rows={6} defaultValue={settings.keywords.join("\n")}/></label>
          <label>Default social image<select name="seo_og_image_asset_id" defaultValue={settings.ogImageAssetId ?? ""}><option value="">Use generated portfolio artwork</option>{images.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName}</option>)}</select></label>
          <div className="form-row"><label>Twitter/X handle<input name="seo_twitter_handle" placeholder="@username" defaultValue={settings.twitterHandle ?? ""}/></label><label className="checkbox-row seo-index-toggle"><input name="seo_index_site" type="checkbox" defaultChecked={settings.indexSite}/><span><strong>Allow public indexing</strong><small>Disable during private staging or major maintenance.</small></span></label></div>
          <div className="form-row"><label>Google verification token<input name="seo_google_site_verification" defaultValue={settings.googleSiteVerification ?? ""}/></label><label>Bing verification token<input name="seo_bing_site_verification" defaultValue={settings.bingSiteVerification ?? ""}/></label></div>
          <SubmitButton pendingLabel="Saving SEO settings…"><Icon name="check" size={17}/> Save SEO settings</SubmitButton>
        </form>

        <form action={updateAnalyticsSettingsAction} className="admin-panel project-form-section">
          <div className="panel-head"><div><span className="eyebrow">Privacy-aware measurement</span><h2>Analytics configuration</h2></div><span>{settings.analyticsProvider}</span></div>
          <label>Third-party provider<select name="analytics_provider" defaultValue={settings.analyticsProvider}><option value="none">None — first-party telemetry only</option><option value="google">Google Analytics 4</option><option value="plausible">Plausible Analytics</option></select></label>
          <div className="form-row"><label>GA4 Measurement ID<input name="analytics_measurement_id" placeholder="G-XXXXXXXXXX" defaultValue={settings.analyticsMeasurementId ?? ""}/></label><label>Plausible tracked domain<input name="analytics_domain" placeholder="saifulshuvo.com" defaultValue={settings.analyticsDomain ?? ""}/></label></div>
          <label>First-party telemetry retention (days)<input name="analytics_retention_days" type="number" min={7} max={730} defaultValue={settings.retentionDays}/></label>
          <div className="settings-check-grid">
            <label className="checkbox-row"><input name="analytics_consent_required" type="checkbox" defaultChecked={settings.consentRequired}/><span><strong>Require analytics consent</strong><small>Show a choice before analytics scripts or first-party telemetry run.</small></span></label>
            <label className="checkbox-row"><input name="analytics_respect_dnt" type="checkbox" defaultChecked={settings.respectDnt}/><span><strong>Respect Do Not Track</strong><small>Skip analytics when the browser sends DNT: 1.</small></span></label>
            <label className="checkbox-row"><input name="analytics_collect_page_views" type="checkbox" defaultChecked={settings.collectPageViews}/><span><strong>Collect page views</strong><small>Store anonymous page paths and sessions.</small></span></label>
            <label className="checkbox-row"><input name="analytics_collect_web_vitals" type="checkbox" defaultChecked={settings.collectWebVitals}/><span><strong>Collect Web Vitals</strong><small>Measure LCP, CLS, INP and related metrics.</small></span></label>
            <label className="checkbox-row"><input name="analytics_collect_client_errors" type="checkbox" defaultChecked={settings.collectClientErrors}/><span><strong>Collect client errors</strong><small>Capture bounded messages and stack excerpts without form data.</small></span></label>
          </div>
          <div className="admin-callout"><Icon name="shield" size={20}/><p>First-party telemetry stores a server-hashed session identifier, never a raw IP address. Third-party provider compliance remains your responsibility.</p></div>
          <SubmitButton pendingLabel="Saving analytics settings…"><Icon name="check" size={17}/> Save analytics settings</SubmitButton>
        </form>
      </div>
    </>
  );
}
