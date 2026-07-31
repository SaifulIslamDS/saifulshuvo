"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/contact/email";
import type { ContactFormState, ContactMessage } from "@/types/contact";

const initialError: ContactFormState = { status: "error", message: "Please review the highlighted fields." };

function value(formData: FormData, key: string): string {
  const candidate = formData.get(key);
  return typeof candidate === "string" ? candidate.trim() : "";
}

function validate(formData: FormData): { values: Record<string, string>; state?: ContactFormState } {
  const values = {
    fullName: value(formData, "full_name"),
    email: value(formData, "email").toLowerCase(),
    company: value(formData, "company"),
    subject: value(formData, "subject"),
    interest: value(formData, "interest"),
    message: value(formData, "message"),
    sourcePage: value(formData, "source_page") || "/contact",
    honeypot: value(formData, "website"),
    startedAt: value(formData, "started_at"),
  };

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (values.fullName.length < 2 || values.fullName.length > 120) fieldErrors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254) fieldErrors.email = "Enter a valid email address.";
  if (values.subject.length < 3 || values.subject.length > 180) fieldErrors.subject = "Add a short, useful subject.";
  if (!values.interest) fieldErrors.interest = "Select what you would like to discuss.";
  if (values.message.length < 20 || values.message.length > 5000) fieldErrors.message = "Write a message between 20 and 5000 characters.";

  if (values.company.length > 160 || values.honeypot) {
    return { values, state: { status: "error", message: "Unable to accept this submission." } };
  }

  const startedAt = Number(values.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 1_500) {
    return { values, state: { status: "error", message: "Please take a moment to review your message and try again." } };
  }

  if (Object.keys(fieldErrors).length) return { values, state: { ...initialError, fieldErrors } };
  return { values };
}

async function requestFingerprint(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = requestHeaders.get("x-nf-client-connection-ip")
    ?? forwarded
    ?? requestHeaders.get("x-real-ip")
    ?? "unknown";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? "unknown";
  const secret = process.env.CONTACT_FINGERPRINT_SECRET
    ?? process.env.RESEND_API_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    ?? "portfolio-contact-v1";
  return createHash("sha256").update(`${secret}|${ip}|${userAgent}`).digest("hex");
}

function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/too many|daily message limit/i.test(message)) return message;
  if (/valid email|full name|useful subject|discussion topic|between 20/i.test(message)) return message;
  return "Your message could not be submitted. Please try again or contact me by email.";
}

export async function submitContactAction(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const validation = validate(formData);
  if (validation.state) return validation.state;

  const { values } = validation;
  const supabase = await createClient();
  const notificationToken = randomBytes(32).toString("hex");

  try {
    const { data, error } = await supabase.rpc("submit_contact_message", {
      p_full_name: values.fullName,
      p_email: values.email,
      p_company: values.company || null,
      p_subject: values.subject,
      p_interest: values.interest,
      p_message: values.message,
      p_source_page: values.sourcePage,
      p_fingerprint_hash: await requestFingerprint(),
      p_notification_token: notificationToken,
      p_honeypot: values.honeypot,
    });
    if (error) throw error;

    const id = typeof data === "string" ? data : String(data ?? "");
    if (!id) throw new Error("The contact message ID was not returned.");

    const now = new Date().toISOString();
    const contact: ContactMessage = {
      id,
      fullName: values.fullName,
      email: values.email,
      company: values.company || undefined,
      subject: values.subject,
      interest: values.interest,
      message: values.message,
      sourcePage: values.sourcePage,
      status: "new",
      priority: "normal",
      notificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const notification = await sendContactNotification(contact);
    const { error: finalizeError } = await supabase.rpc("finalize_contact_notification", {
      p_message_id: id,
      p_notification_token: notificationToken,
      p_status: notification.status,
      p_provider_id: notification.providerId ?? null,
      p_error: notification.error ?? null,
    });
    if (finalizeError) console.error("Unable to record contact notification result:", finalizeError.message);

    return {
      status: "success",
      message: "Thank you. Your message has been received and saved securely. I will respond as soon as possible.",
    };
  } catch (error) {
    console.error("Contact submission failed:", error);
    return { status: "error", message: publicError(error) };
  }
}
