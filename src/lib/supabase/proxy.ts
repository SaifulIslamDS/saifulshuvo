import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublicConfig,
  hasSupabasePublicConfig,
} from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabasePublicConfig()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims verifies the token and refreshes it when required.
  await supabase.auth.getClaims();

  return response;
}
