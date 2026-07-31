"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { sendContactNotification } from "@/lib/contact/email";
import { getAdminContactMessage } from "@/lib/contact/queries";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessageStatus, ContactPriority } from "@/types/contact";

const statuses = new Set<ContactMessageStatus>(["new", "read", "replied", "archived", "spam"]);
const priorities = new Set<ContactPriority>(["low", "normal", "high"]);

function value(formData: FormData, key: string): string {
  const candidate = formData.get(key);
  return typeof candidate === "string" ? candidate.trim() : "";
}

function destination(path: string, type: "success" | "error", message: string): string {
  const query = new URLSearchParams({ [type]: message });
  return `${path}?${query.toString()}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to complete the contact inbox operation.";
}

async function audit(eventType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("audit_events").insert({
    actor_id: admin.id,
    event_type: eventType,
    entity_type: "contact_message",
    entity_id: entityId,
    metadata,
  });
  if (error) console.error("Unable to write contact audit event:", error.message);
}

function refresh(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  if (id) revalidatePath(`/admin/inbox/${id}`);
}

function lifecycleTimestamps(status: ContactMessageStatus) {
  const now = new Date().toISOString();
  return {
    read_at: status === "read" || status === "replied" ? now : null,
    replied_at: status === "replied" ? now : null,
    archived_at: status === "archived" ? now : null,
  };
}

export async function updateContactMessageAction(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const statusValue = value(formData, "status") as ContactMessageStatus;
  const priorityValue = value(formData, "priority") as ContactPriority;
  const notes = value(formData, "admin_notes");

  try {
    if (!statuses.has(statusValue)) throw new Error("Select a valid inbox status.");
    if (!priorities.has(priorityValue)) throw new Error("Select a valid priority.");
    if (notes.length > 5000) throw new Error("Admin notes cannot exceed 5000 characters.");

    const current = await getAdminContactMessage(id);
    if (!current) throw new Error("Contact message not found.");

    const timestamps = lifecycleTimestamps(statusValue);
    const { error } = await supabase.from("contact_messages").update({
      status: statusValue,
      priority: priorityValue,
      admin_notes: notes || null,
      read_at: statusValue === "new" ? null : (timestamps.read_at ?? current.readAt ?? new Date().toISOString()),
      replied_at: statusValue === "replied" ? (current.repliedAt ?? timestamps.replied_at) : null,
      archived_at: statusValue === "archived" ? (current.archivedAt ?? timestamps.archived_at) : null,
    }).eq("id", id);
    if (error) throw error;

    await supabase.from("audit_events").insert({
      actor_id: admin.id,
      event_type: "contact.updated",
      entity_type: "contact_message",
      entity_id: id,
      metadata: {
        previous_status: current.status,
        status: statusValue,
        priority: priorityValue,
        notes_updated: notes !== (current.adminNotes ?? ""),
      },
    });
    refresh(id);
  } catch (error) {
    redirect(destination(`/admin/inbox/${id}`, "error", errorMessage(error)));
  }

  redirect(destination(`/admin/inbox/${id}`, "success", "Contact message updated."));
}

export async function setContactStatusAction(id: string, status: ContactMessageStatus) {
  await requireAdmin();
  const supabase = await createClient();
  try {
    if (!statuses.has(status)) throw new Error("Invalid contact status.");
    const current = await getAdminContactMessage(id);
    if (!current) throw new Error("Contact message not found.");
    const timestamps = lifecycleTimestamps(status);
    const { error } = await supabase.from("contact_messages").update({
      status,
      read_at: status === "new" ? null : (current.readAt ?? timestamps.read_at ?? new Date().toISOString()),
      replied_at: status === "replied" ? (current.repliedAt ?? timestamps.replied_at) : null,
      archived_at: status === "archived" ? (current.archivedAt ?? timestamps.archived_at) : null,
    }).eq("id", id);
    if (error) throw error;
    await audit(`contact.${status}`, id, { previous_status: current.status });
    refresh(id);
  } catch (error) {
    redirect(destination(`/admin/inbox/${id}`, "error", errorMessage(error)));
  }
  redirect(destination(`/admin/inbox/${id}`, "success", `Message marked as ${status}.`));
}

export async function retryContactNotificationAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  try {
    const message = await getAdminContactMessage(id);
    if (!message) throw new Error("Contact message not found.");
    const result = await sendContactNotification(message);
    const { error } = await supabase.from("contact_messages").update({
      notification_status: result.status,
      notification_provider_id: result.providerId ?? null,
      notification_error: result.error ?? null,
      notification_attempted_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    await audit("contact.notification_retried", id, { status: result.status, provider_id: result.providerId ?? null });
    refresh(id);
    if (result.status === "failed") throw new Error(result.error ?? "Email notification failed.");
    if (result.status === "skipped") throw new Error(result.error ?? "Email notifications are not configured.");
  } catch (error) {
    redirect(destination(`/admin/inbox/${id}`, "error", errorMessage(error)));
  }
  redirect(destination(`/admin/inbox/${id}`, "success", "Email notification sent."));
}

export async function deleteContactMessageAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  try {
    const message = await getAdminContactMessage(id);
    if (!message) throw new Error("Contact message not found.");
    if (message.status !== "archived" && message.status !== "spam") {
      throw new Error("Archive the message or mark it as spam before permanent deletion.");
    }
    await audit("contact.deleted", id, { email: message.email, status: message.status, subject: message.subject });
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    refresh();
  } catch (error) {
    redirect(destination(`/admin/inbox/${id}`, "error", errorMessage(error)));
  }
  redirect(destination("/admin/inbox", "success", "Contact message permanently deleted."));
}
