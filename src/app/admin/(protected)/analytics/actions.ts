"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function purgeExpiredTelemetryAction() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("purge_expired_telemetry");
  if (error) redirect(`/admin/analytics?error=${encodeURIComponent(error.message)}`);
  const deleted = Number(data ?? 0);
  await supabase.from("audit_events").insert({
    actor_id: admin.id,
    event_type: "analytics.telemetry_purged",
    entity_type: "telemetry",
    entity_id: "retention",
    metadata: { deleted },
  });
  revalidatePath("/admin/analytics");
  redirect(`/admin/analytics?success=${encodeURIComponent(`${deleted} expired telemetry event${deleted === 1 ? "" : "s"} removed.`)}`);
}
