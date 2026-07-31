"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function optional(formData: FormData, key: string): string | null {
  return value(formData, key) || null;
}
function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}
function lines(formData: FormData, key: string): string[] {
  return value(formData, key).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}
function destination(type: "success" | "error", message: string): string {
  return `/admin/seo?${type}=${encodeURIComponent(message)}`;
}
function fail(error: unknown): never {
  redirect(destination("error", error instanceof Error ? error.message : "The SEO settings could not be saved."));
}
function refreshSeo() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/opengraph-image");
  revalidatePath("/admin/seo");
  revalidatePath("/admin/analytics");
}

export async function updateSeoSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  try {
    const defaultTitle = value(formData, "seo_default_title");
    const titleTemplate = value(formData, "seo_title_template");
    const description = value(formData, "seo_default_description");
    if (defaultTitle.length < 20 || defaultTitle.length > 120) throw new Error("Default SEO title must be between 20 and 120 characters.");
    if (!titleTemplate.includes("%s")) throw new Error("The title template must include %s for the page title.");
    if (description.length < 50 || description.length > 320) throw new Error("Default description must be between 50 and 320 characters.");

    const twitterHandleRaw = optional(formData, "seo_twitter_handle");
    const twitterHandle = twitterHandleRaw ? `@${twitterHandleRaw.replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "")}` : null;
    const payload = {
      seo_default_title: defaultTitle,
      seo_title_template: titleTemplate,
      seo_default_description: description,
      seo_keywords: lines(formData, "seo_keywords").slice(0, 40),
      seo_og_image_asset_id: optional(formData, "seo_og_image_asset_id"),
      seo_twitter_handle: twitterHandle,
      seo_index_site: checked(formData, "seo_index_site"),
      seo_google_site_verification: optional(formData, "seo_google_site_verification"),
      seo_bing_site_verification: optional(formData, "seo_bing_site_verification"),
      updated_by: admin.id,
    };
    const { error } = await supabase.from("site_settings").update(payload).eq("id", "primary");
    if (error) throw error;
    await supabase.from("audit_events").insert({
      actor_id: admin.id,
      event_type: "seo.settings_updated",
      entity_type: "site_settings",
      entity_id: "primary",
      metadata: { index_site: payload.seo_index_site, keyword_count: payload.seo_keywords.length },
    });
    refreshSeo();
  } catch (error) { fail(error); }
  redirect(destination("success", "SEO defaults, indexing controls and verification settings saved."));
}

export async function updateAnalyticsSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  try {
    const provider = value(formData, "analytics_provider");
    if (!new Set(["none", "google", "plausible"]).has(provider)) throw new Error("Unsupported analytics provider.");
    const measurementId = optional(formData, "analytics_measurement_id");
    const domain = optional(formData, "analytics_domain");
    if (provider === "google" && !measurementId?.match(/^G-[A-Z0-9]+$/i)) throw new Error("Google Analytics requires a valid GA4 Measurement ID such as G-XXXXXXXXXX.");
    if (provider === "plausible" && !domain?.match(/^[a-z0-9.-]+$/i)) throw new Error("Plausible requires a valid tracked domain.");
    const retentionDays = Number.parseInt(value(formData, "analytics_retention_days"), 10);
    if (!Number.isInteger(retentionDays) || retentionDays < 7 || retentionDays > 730) throw new Error("Analytics retention must be between 7 and 730 days.");

    const payload = {
      analytics_provider: provider,
      analytics_measurement_id: provider === "google" ? measurementId : null,
      analytics_domain: provider === "plausible" ? domain : null,
      analytics_consent_required: checked(formData, "analytics_consent_required"),
      analytics_respect_dnt: checked(formData, "analytics_respect_dnt"),
      analytics_collect_page_views: checked(formData, "analytics_collect_page_views"),
      analytics_collect_web_vitals: checked(formData, "analytics_collect_web_vitals"),
      analytics_collect_client_errors: checked(formData, "analytics_collect_client_errors"),
      analytics_retention_days: retentionDays,
      updated_by: admin.id,
    };
    const { error } = await supabase.from("site_settings").update(payload).eq("id", "primary");
    if (error) throw error;
    await supabase.from("audit_events").insert({
      actor_id: admin.id,
      event_type: "analytics.settings_updated",
      entity_type: "site_settings",
      entity_id: "primary",
      metadata: { provider, retention_days: retentionDays },
    });
    refreshSeo();
  } catch (error) { fail(error); }
  redirect(destination("success", "Analytics, consent and telemetry settings saved."));
}
