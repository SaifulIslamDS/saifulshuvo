import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSeoAnalyticsSettings } from "@/lib/seo/queries";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["page_view", "web_vital", "client_error"]);

function hashSession(sessionId: string): string {
  const secret = process.env.TELEMETRY_HASH_SECRET || process.env.CONTACT_FINGERPRINT_SECRET || "portfolio-telemetry";
  return createHash("sha256").update(`${secret}:${sessionId}`).digest("hex");
}

export async function POST(request: NextRequest) {
  if (!hasSupabasePublicConfig()) return new NextResponse(null, { status: 204 });

  try {
    const settings = await getSeoAnalyticsSettings(false);
    if (settings.respectDnt && request.headers.get("dnt") === "1") return new NextResponse(null, { status: 204 });

    const body = await request.json() as Record<string, unknown>;
    const eventType = typeof body.eventType === "string" ? body.eventType : "";
    const path = typeof body.path === "string" ? body.path : "/";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

    if (!allowedTypes.has(eventType) || sessionId.length < 16 || sessionId.length > 128 || path.length > 300) {
      return NextResponse.json({ error: "Invalid telemetry payload." }, { status: 400 });
    }
    if (eventType === "page_view" && !settings.collectPageViews) return new NextResponse(null, { status: 204 });
    if (eventType === "web_vital" && !settings.collectWebVitals) return new NextResponse(null, { status: 204 });
    if (eventType === "client_error" && !settings.collectClientErrors) return new NextResponse(null, { status: 204 });

    const metadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata as Record<string, unknown>
      : {};
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_telemetry_event", {
      p_event_type: eventType,
      p_path: path,
      p_session_hash: hashSession(sessionId),
      p_metric_name: typeof body.metricName === "string" ? body.metricName.slice(0, 80) : null,
      p_metric_value: typeof body.metricValue === "number" && Number.isFinite(body.metricValue) ? body.metricValue : null,
      p_metric_rating: typeof body.metricRating === "string" ? body.metricRating : null,
      p_metadata: metadata,
    });

    if (error) {
      const status = error.message.toLowerCase().includes("rate limit") ? 429 : 400;
      return NextResponse.json({ error: status === 429 ? "Rate limit exceeded." : "Telemetry rejected." }, { status });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Telemetry unavailable." }, { status: 503 });
  }
}
