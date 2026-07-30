import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  hasCmsConfiguration,
  isAllowedAdminEmail,
} from "@/lib/supabase/env";

function getSafeNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!hasCmsConfiguration()) {
    return NextResponse.redirect(
      new URL("/admin/login?error=configuration", requestUrl.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback", requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedAdminEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=not_authorized", requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
