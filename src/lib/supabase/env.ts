const PUBLIC_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_KEY_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type SupabasePublicConfig = { url: string; publishableKey: string };

export function hasSupabasePublicConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error(`Missing ${PUBLIC_URL_KEY} or ${PUBLIC_KEY_KEY}. See docs/SUPABASE-SETUP.md.`);
  return { url, publishableKey };
}

export function getAdminEmails(): string[] {
  const values = [process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(values)];
}

/** Backward-compatible helper for earlier documentation. */
export function getAdminEmail(): string | null {
  return getAdminEmails()[0] ?? null;
}

export function hasCmsConfiguration(): boolean {
  return hasSupabasePublicConfig() && getAdminEmails().length > 0;
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && getAdminEmails().includes(email.trim().toLowerCase()));
}

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const netlifyUrl = process.env.URL?.trim();
  return (configuredUrl || netlifyUrl || "http://localhost:3000").replace(/\/$/, "");
}
