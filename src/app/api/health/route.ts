import { NextResponse } from "next/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "unconfigured" | "error" = hasSupabasePublicConfig() ? "error" : "unconfigured";

  if (hasSupabasePublicConfig()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("site_settings").select("id", { head: true, count: "exact" }).eq("id", "primary");
      database = error ? "error" : "ok";
    } catch {
      database = "error";
    }
  }

  const healthy = database !== "error";
  return NextResponse.json({
    status: healthy ? "ok" : "degraded",
    version: "0.9.0",
    database,
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }, {
    status: healthy ? 200 : 503,
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
