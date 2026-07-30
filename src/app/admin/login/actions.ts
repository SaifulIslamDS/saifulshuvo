"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSiteUrl,
  hasCmsConfiguration,
} from "@/lib/supabase/env";

async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const forwardedProtocol = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) return `${forwardedProtocol}://${host}`;
  return getSiteUrl();
}

export async function signInWithGoogle() {
  if (!hasCmsConfiguration()) {
    redirect("/admin/login?error=configuration");
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const redirectTo = `${origin}/auth/callback?next=/admin`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect("/admin/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  if (hasCmsConfiguration()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/admin/login?signedOut=1");
}
