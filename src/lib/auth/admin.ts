import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  hasCmsConfiguration,
  isAllowedAdminEmail,
} from "@/lib/supabase/env";

export type AdminIdentity = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

function getDisplayName(metadata: Record<string, unknown>, email: string): string {
  const candidate = metadata.full_name ?? metadata.name ?? metadata.user_name;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : email.split("@")[0];
}

export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  if (!hasCmsConfiguration()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email || !isAllowedAdminEmail(user.email)) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const avatar = metadata.avatar_url ?? metadata.picture;

  return {
    id: user.id,
    email: user.email,
    name: getDisplayName(metadata, user.email),
    avatarUrl: typeof avatar === "string" ? avatar : null,
  };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  if (!hasCmsConfiguration()) {
    redirect("/admin/login?error=configuration");
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
