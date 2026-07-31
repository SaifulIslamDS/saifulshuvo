import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getAdminPostCounts, getAdminPosts } from "@/lib/posts/queries";
import { getAdminProjectCounts, getAdminProjects } from "@/lib/projects/queries";
import { getAdminCvDocuments, getAdminMediaAssets } from "@/lib/media/queries";
import { getExperienceEntries, getHomepageContent, getSkillGroups } from "@/lib/profile/queries";
import { getAdminContactMessages, getContactInboxCounts } from "@/lib/contact/queries";

export default async function AdminDashboardPage() {
  const [
    projectCounts,
    projects,
    postCounts,
    posts,
    mediaAssets,
    cvDocuments,
    groups,
    experiences,
    homepage,
    inboxCounts,
    inbox,
  ] = await Promise.all([
    getAdminProjectCounts(),
    getAdminProjects(),
    getAdminPostCounts(),
    getAdminPosts(),
    getAdminMediaAssets({ status: "active" }),
    getAdminCvDocuments(),
    getSkillGroups({ admin: true }),
    getExperienceEntries({ admin: true }),
    getHomepageContent(),
    getContactInboxCounts(),
    getAdminContactMessages({ pageSize: 4 }),
  ]);

  const skills = groups.flatMap((group) => group.skills);
  const stats = [
    ["Projects", projectCounts.total.toString(), `${projectCounts.published} published`, "folder"],
    ["Articles", postCounts.total.toString(), `${postCounts.published} published`, "file"],
    ["Inbox", inboxCounts.total.toString(), `${inboxCounts.unread} unread`, "inbox"],
    ["Skills", skills.length.toString(), `${skills.filter((skill) => skill.active).length} visible`, "layers"],
    ["Experience", experiences.length.toString(), `${experiences.filter((item) => item.active).length} visible`, "briefcase"],
    ["Media assets", mediaAssets.length.toString(), `${cvDocuments.length} CV version${cvDocuments.length === 1 ? "" : "s"}`, "image"],
  ];

  const recentContent = [
    ...inbox.messages.slice(0, 2).map((message) => ({
      id: message.id,
      title: message.subject,
      note: `${message.fullName} · ${message.interest}`,
      status: message.status,
      href: `/admin/inbox/${message.id}`,
      icon: "inbox",
      badgeClass: `contact-status contact-status-${message.status}`,
    })),
    ...posts.slice(0, 2).map((post) => ({
      id: post.id,
      title: post.title,
      note: `${post.categoryLabel} · ${post.readTimeMinutes} min`,
      status: post.publicationStatus,
      href: `/admin/posts/${post.id}/edit`,
      icon: "file",
      badgeClass: `publication-badge publication-${post.publicationStatus}`,
    })),
    ...projects.slice(0, 1).map((project) => ({
      id: project.id,
      title: project.title,
      note: project.category,
      status: project.publicationStatus,
      href: `/admin/projects/${project.id}/edit`,
      icon: "folder",
      badgeClass: `publication-badge publication-${project.publicationStatus}`,
    })),
  ];

  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">CMS overview</span><h1>Dashboard</h1><p>Manage the portfolio, publishing workflow and contact enquiries from one secure workspace.</p></div>
        <div className="admin-actions"><Link href="/admin/inbox" className="button button-primary"><Icon name="inbox" size={17}/> Open inbox</Link><Link href="/" className="button button-secondary"><Icon name="eye" size={17}/> View website</Link></div>
      </div>

      <div className="admin-stat-grid dashboard-six-stats">
        {stats.map(([label, value, note, icon]) => <article key={label}><span className="icon-box small"><Icon name={icon} size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Recent activity</span><h2>Inbox and publishing</h2></div><Link href="/admin/inbox">View inbox</Link></div>
          <div className="content-table">
            {recentContent.map((item) => <div className="content-row" key={`${item.icon}-${item.id}`}><span className="table-thumb"><Icon name={item.icon} size={18}/></span><div><strong>{item.title}</strong><small>{item.note}</small></div><span className={item.badgeClass}>{item.status === "new" ? "Unread" : item.status}</span><Link aria-label={`Open ${item.title}`} href={item.href}><Icon name="edit" size={17}/></Link></div>)}
            {!recentContent.length ? <div className="empty-state compact"><Icon name="inbox" size={28}/><h3>No recent activity</h3><p>Published content and new enquiries will appear here.</p></div> : null}
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Release progress</span><h2>CMS readiness</h2></div></div>
          <div className="readiness-score"><div className="score-ring score-ring-96"><span>96%</span></div><p>Content, media and contact operations are functional. Final SEO, analytics, accessibility, performance and domain migration remain.</p></div>
          <ul className="readiness-list">
            <li className="done"><Icon name="check" size={14}/> Authentication and RLS</li>
            <li className="done"><Icon name="check" size={14}/> Project and Blog CMS</li>
            <li className="done"><Icon name="check" size={14}/> Media, CV and homepage CMS</li>
            <li className="done"><Icon name="check" size={14}/> Skills and Experience CMS</li>
            <li className="done"><Icon name="check" size={14}/> Contact inbox and notifications</li>
            <li><span/> Production optimisation and domain migration</li>
          </ul>
          <div className="version-note"><span>Homepage content v{homepage.version}</span><small>{inboxCounts.notificationFailures ? `${inboxCounts.notificationFailures} email notification failure${inboxCounts.notificationFailures === 1 ? "" : "s"} need attention.` : "Email notification queue has no recorded failures."}</small></div>
        </section>
      </div>

      <section className="admin-panel quick-actions-panel">
        <div className="panel-head"><div><span className="eyebrow">Quick actions</span><h2>Continue managing the portfolio</h2></div></div>
        <div className="quick-action-grid"><Link href="/admin/inbox"><Icon name="inbox"/><span><strong>Review enquiries</strong><small>Unread, replied and notification status</small></span></Link><Link href="/admin/homepage"><Icon name="spark"/><span><strong>Edit homepage</strong><small>Hero, About, process, CTA and services</small></span></Link><Link href="/admin/posts/new"><Icon name="file"/><span><strong>Write an article</strong><small>Rich editor, revisions and SEO</small></span></Link><Link href="/admin/media"><Icon name="image"/><span><strong>Manage media</strong><small>Images, project assets and CV versions</small></span></Link></div>
      </section>
    </>
  );
}
