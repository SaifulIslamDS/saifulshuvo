import type { ContactMessage } from "@/types/contact";

export type NotificationResult = {
  status: "sent" | "failed" | "skipped";
  providerId?: string;
  error?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function recipients(): string[] {
  return (process.env.CONTACT_NOTIFICATION_TO ?? "")
    .split(",")
    .map((value: string) => value.trim().toLowerCase())
    .filter((value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export function hasContactEmailConfiguration(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim()
      && process.env.CONTACT_FROM_EMAIL?.trim()
      && recipients().length,
  );
}

function buildHtml(message: ContactMessage, adminUrl: string): string {
  const company = message.company
    ? `<tr><td style="padding:7px 0;color:#64748b">Company</td><td style="padding:7px 0"><strong>${escapeHtml(message.company)}</strong></td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px">
    <div style="background:#08111f;border-radius:18px 18px 0 0;padding:24px;color:#fff">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#67e8f9">Portfolio contact inbox</div>
      <h1 style="margin:10px 0 0;font-size:24px">New message from ${escapeHtml(message.fullName)}</h1>
    </div>
    <div style="background:#fff;border:1px solid #dbe4ef;border-top:0;padding:26px;border-radius:0 0 18px 18px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:7px 0;color:#64748b;width:120px">Email</td><td style="padding:7px 0"><a href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a></td></tr>
        ${company}
        <tr><td style="padding:7px 0;color:#64748b">Topic</td><td style="padding:7px 0"><strong>${escapeHtml(message.interest)}</strong></td></tr>
        <tr><td style="padding:7px 0;color:#64748b">Subject</td><td style="padding:7px 0"><strong>${escapeHtml(message.subject)}</strong></td></tr>
      </table>
      <div style="margin:22px 0;padding:18px;background:#f8fafc;border-left:4px solid #06b6d4;border-radius:8px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message.message)}</div>
      <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;background:#0e7490;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">Open in Portfolio CMS</a>
      <p style="margin:20px 0 0;color:#64748b;font-size:12px">Reply directly to this notification to respond to ${escapeHtml(message.fullName)}.</p>
    </div>
  </div>
</body></html>`;
}

function buildText(message: ContactMessage, adminUrl: string): string {
  return [
    `New portfolio message from ${message.fullName}`,
    `Email: ${message.email}`,
    message.company ? `Company: ${message.company}` : "",
    `Topic: ${message.interest}`,
    `Subject: ${message.subject}`,
    "",
    message.message,
    "",
    `Open in CMS: ${adminUrl}`,
  ].filter(Boolean).join("\n");
}

export async function sendContactNotification(message: ContactMessage): Promise<NotificationResult> {
  if (!hasContactEmailConfiguration()) {
    return { status: "skipped", error: "Contact email notifications are not configured." };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const adminUrl = `${siteUrl}/admin/inbox/${message.id}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-contact-${message.id}`,
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL?.trim(),
        to: recipients(),
        reply_to: message.email,
        subject: `[Portfolio] ${message.interest}: ${message.subject}`.slice(0, 180),
        html: buildHtml(message, adminUrl),
        text: buildText(message, adminUrl),
        tags: [
          { name: "source", value: "portfolio-contact" },
          { name: "message_id", value: message.id.replaceAll("-", "_") },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const payload = await response.json().catch(() => null) as { id?: string; message?: string; name?: string } | null;
    if (!response.ok) {
      return {
        status: "failed",
        error: payload?.message ?? payload?.name ?? `Resend returned HTTP ${response.status}.`,
      };
    }

    return { status: "sent", providerId: payload?.id };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unexpected email provider error.",
    };
  }
}
