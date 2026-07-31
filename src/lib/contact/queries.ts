import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ContactInboxCounts, ContactMessage, ContactMessageStatus } from "@/types/contact";

function text(value: unknown): string { return typeof value === "string" ? value : ""; }
function optional(value: unknown): string | undefined { const resolved = text(value); return resolved || undefined; }

function mapContact(row: Record<string, unknown>): ContactMessage {
  return {
    id: text(row.id),
    fullName: text(row.full_name),
    email: text(row.email),
    company: optional(row.company),
    subject: text(row.subject),
    interest: text(row.interest),
    message: text(row.message),
    sourcePage: text(row.source_page) || "/contact",
    status: text(row.status) as ContactMessage["status"],
    priority: text(row.priority) as ContactMessage["priority"],
    adminNotes: optional(row.admin_notes),
    notificationStatus: text(row.notification_status) as ContactMessage["notificationStatus"],
    notificationProviderId: optional(row.notification_provider_id),
    notificationError: optional(row.notification_error),
    notificationAttemptedAt: optional(row.notification_attempted_at),
    readAt: optional(row.read_at),
    repliedAt: optional(row.replied_at),
    archivedAt: optional(row.archived_at),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

export async function getAdminContactMessages(options?: {
  status?: ContactMessageStatus | "all";
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ messages: ContactMessage[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options?.pageSize ?? 20));
  if (!hasSupabasePublicConfig()) return { messages: [], total: 0, page, pageSize };

  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.status && options.status !== "all") query = query.eq("status", options.status);
  const search = options?.query?.trim();
  if (search) {
    const safe = search.replace(/[^a-zA-Z0-9@._+\-\s]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%,subject.ilike.%${safe}%,interest.ilike.%${safe}%`);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) {
    console.error("Unable to load contact inbox:", error.message);
    return { messages: [], total: 0, page, pageSize };
  }

  return {
    messages: (data ?? []).map((row: unknown) => mapContact(row as Record<string, unknown>)),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminContactMessage(id: string): Promise<ContactMessage | null> {
  if (!hasSupabasePublicConfig()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapContact(data as Record<string, unknown>);
}

async function countBy(column: string, value: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq(column, value);
  return count ?? 0;
}

export async function getContactInboxCounts(): Promise<ContactInboxCounts> {
  if (!hasSupabasePublicConfig()) return { total: 0, unread: 0, replied: 0, archived: 0, spam: 0, notificationFailures: 0 };
  const supabase = await createClient();
  const [totalResult, unread, replied, archived, spam, notificationFailures] = await Promise.all([
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    countBy("status", "new"),
    countBy("status", "replied"),
    countBy("status", "archived"),
    countBy("status", "spam"),
    countBy("notification_status", "failed"),
  ]);
  return { total: totalResult.count ?? 0, unread, replied, archived, spam, notificationFailures };
}
