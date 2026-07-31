import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { getAdminContactMessages, getContactInboxCounts } from "@/lib/contact/queries";
import type { ContactMessageStatus } from "@/types/contact";

type Props = {
  searchParams: Promise<{ status?: string; q?: string; page?: string; success?: string; error?: string }>;
};

const validStatuses = new Set(["all", "new", "read", "replied", "archived", "spam"]);

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function pageHref(page: number, status: string, query: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/admin/inbox${suffix ? `?${suffix}` : ""}`;
}

export default async function ContactInboxPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = validStatuses.has(params.status ?? "all") ? (params.status ?? "all") : "all";
  const q = params.q?.trim().slice(0, 120) ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const [{ messages, total, pageSize }, counts] = await Promise.all([
    getAdminContactMessages({ status: status as ContactMessageStatus | "all", query: q, page }),
    getContactInboxCounts(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Contact operations</span><h1>Contact inbox</h1><p>Review enquiries, maintain response status and monitor delivery of email notifications.</p></div>
        <Link href="/contact" className="button button-secondary"><Icon name="external" size={17}/> View contact form</Link>
      </div>
      <AdminFlash success={params.success} error={params.error} />

      <div className="admin-stat-grid inbox-stat-grid">
        {[
          ["Total messages", counts.total, "All recorded enquiries", "inbox"],
          ["Unread", counts.unread, "Needs attention", "mail"],
          ["Replied", counts.replied, "Response recorded", "check"],
          ["Email failures", counts.notificationFailures, "Notification retry needed", "alert"],
        ].map(([label, value, note, icon]) => (
          <article key={String(label)}><span className="icon-box small"><Icon name={String(icon)} size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>
        ))}
      </div>

      <section className="admin-panel inbox-panel">
        <form className="inbox-toolbar" method="get">
          <label className="inbox-search"><Icon name="search" size={17}/><input name="q" defaultValue={q} placeholder="Search name, email, company or subject" /></label>
          <select name="status" defaultValue={status} aria-label="Filter by status">
            <option value="all">All messages</option>
            <option value="new">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
            <option value="spam">Spam</option>
          </select>
          <button className="button button-primary" type="submit">Filter</button>
          {(q || status !== "all") ? <Link href="/admin/inbox" className="button button-ghost">Clear</Link> : null}
        </form>

        <div className="inbox-list">
          {messages.map((message) => (
            <Link href={`/admin/inbox/${message.id}`} className={`inbox-row inbox-status-${message.status}`} key={message.id}>
              <span className="inbox-avatar">{message.fullName.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</span>
              <span className="inbox-main">
                <span className="inbox-sender"><strong>{message.fullName}</strong><small>{message.email}</small></span>
                <strong className="inbox-subject">{message.subject}</strong>
                <small className="inbox-preview">{message.message}</small>
              </span>
              <span className="inbox-meta">
                <time>{formatDate(message.createdAt)}</time>
                <span className={`contact-status contact-status-${message.status}`}>{message.status === "new" ? "Unread" : message.status}</span>
                <span className={`notification-badge notification-${message.notificationStatus}`}>{message.notificationStatus}</span>
              </span>
            </Link>
          ))}
        </div>

        {!messages.length ? <div className="empty-state"><Icon name="inbox" size={36}/><h3>No messages found</h3><p>New contact submissions will appear here after migration and form deployment.</p></div> : null}

        {totalPages > 1 ? (
          <nav className="admin-pagination" aria-label="Inbox pagination">
            <Link aria-disabled={page <= 1} className={page <= 1 ? "disabled" : ""} href={pageHref(Math.max(1, page - 1), status, q)}>Previous</Link>
            <span>Page {page} of {totalPages}</span>
            <Link aria-disabled={page >= totalPages} className={page >= totalPages ? "disabled" : ""} href={pageHref(Math.min(totalPages, page + 1), status, q)}>Next</Link>
          </nav>
        ) : null}
      </section>
    </>
  );
}
