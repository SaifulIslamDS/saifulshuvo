import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  deleteContactMessageAction,
  retryContactNotificationAction,
  setContactStatusAction,
  updateContactMessageAction,
} from "@/app/admin/(protected)/inbox/actions";
import { getAdminContactMessage } from "@/lib/contact/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

function formatDate(value?: string): string {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

export default async function ContactMessagePage({ params, searchParams }: Props) {
  const [{ id }, flash] = await Promise.all([params, searchParams]);
  const message = await getAdminContactMessage(id);
  if (!message) notFound();
  const replySubject = encodeURIComponent(`Re: ${message.subject}`);
  const replyBody = encodeURIComponent(`Hello ${message.fullName},\n\nThank you for contacting me.\n\n`);

  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Contact inbox</span><h1>{message.subject}</h1><p>Received {formatDate(message.createdAt)} from {message.fullName}.</p></div>
        <div className="admin-actions"><Link href="/admin/inbox" className="button button-secondary"><Icon name="arrow-left" size={17}/> Back to inbox</Link><a href={`mailto:${message.email}?subject=${replySubject}&body=${replyBody}`} className="button button-primary"><Icon name="reply" size={17}/> Reply by email</a></div>
      </div>
      <AdminFlash success={flash.success} error={flash.error} />

      <div className="inbox-detail-grid">
        <section className="admin-panel message-content-panel">
          <div className="message-header-card">
            <span className="inbox-avatar large">{message.fullName.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</span>
            <div><h2>{message.fullName}</h2><a href={`mailto:${message.email}`}>{message.email}</a>{message.company ? <small>{message.company}</small> : null}</div>
            <span className={`contact-status contact-status-${message.status}`}>{message.status === "new" ? "Unread" : message.status}</span>
          </div>
          <dl className="message-facts">
            <div><dt>Discussion topic</dt><dd>{message.interest}</dd></div>
            <div><dt>Priority</dt><dd className={`priority-${message.priority}`}>{message.priority}</dd></div>
            <div><dt>Source</dt><dd>{message.sourcePage}</dd></div>
            <div><dt>Email notification</dt><dd><span className={`notification-badge notification-${message.notificationStatus}`}>{message.notificationStatus}</span></dd></div>
          </dl>
          <div className="message-body"><p>{message.message}</p></div>
          {message.notificationError ? <div className="admin-notice notification-error-notice"><Icon name="alert" size={19}/><div><strong>Notification detail</strong><p>{message.notificationError}</p></div></div> : null}
        </section>

        <aside className="inbox-detail-sidebar">
          <form action={updateContactMessageAction.bind(null, message.id)} className="admin-panel inbox-update-form">
            <div className="panel-head"><div><span className="eyebrow">Workflow</span><h2>Manage message</h2></div></div>
            <label>Status<select name="status" defaultValue={message.status}><option value="new">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option><option value="spam">Spam</option></select></label>
            <label>Priority<select name="priority" defaultValue={message.priority}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
            <label>Private admin notes<textarea name="admin_notes" rows={6} maxLength={5000} defaultValue={message.adminNotes} placeholder="Response context, follow-up notes or qualification details..." /></label>
            <SubmitButton pendingLabel="Saving…">Save inbox changes</SubmitButton>
          </form>

          <section className="admin-panel inbox-actions-panel">
            <div className="panel-head"><div><span className="eyebrow">Quick actions</span><h2>Message operations</h2></div></div>
            <div className="inbox-action-stack">
              {message.status === "new" ? <form action={setContactStatusAction.bind(null, message.id, "read")}><button className="row-action" type="submit"><Icon name="eye" size={16}/> Mark read</button></form> : null}
              {message.status !== "replied" ? <form action={setContactStatusAction.bind(null, message.id, "replied")}><button className="row-action" type="submit"><Icon name="check" size={16}/> Mark replied</button></form> : null}
              {message.status === "archived" || message.status === "spam" ? <form action={setContactStatusAction.bind(null, message.id, "read")}><button className="row-action" type="submit"><Icon name="restore" size={16}/> Restore to read</button></form> : <form action={setContactStatusAction.bind(null, message.id, "archived")}><button className="row-action" type="submit"><Icon name="archive" size={16}/> Archive</button></form>}
              <form action={retryContactNotificationAction.bind(null, message.id)}><button className="row-action" type="submit"><Icon name="mail" size={16}/> Retry notification</button></form>
              {(message.status === "archived" || message.status === "spam") ? <form action={deleteContactMessageAction.bind(null, message.id)}><ConfirmSubmitButton variant="danger" confirmMessage={`Permanently delete the message from ${message.fullName}?`}>Permanently delete</ConfirmSubmitButton></form> : null}
            </div>
          </section>

          <section className="admin-panel message-timeline-panel">
            <div className="panel-head"><div><span className="eyebrow">Timeline</span><h2>Activity</h2></div></div>
            <ul className="message-timeline"><li><span/><div><strong>Received</strong><small>{formatDate(message.createdAt)}</small></div></li>{message.readAt ? <li><span/><div><strong>Read</strong><small>{formatDate(message.readAt)}</small></div></li> : null}{message.repliedAt ? <li><span/><div><strong>Replied</strong><small>{formatDate(message.repliedAt)}</small></div></li> : null}{message.archivedAt ? <li><span/><div><strong>Archived</strong><small>{formatDate(message.archivedAt)}</small></div></li> : null}{message.notificationAttemptedAt ? <li><span/><div><strong>Notification {message.notificationStatus}</strong><small>{formatDate(message.notificationAttemptedAt)}</small></div></li> : null}</ul>
          </section>
        </aside>
      </div>
    </>
  );
}
