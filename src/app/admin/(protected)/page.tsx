import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getAdminPostCounts, getAdminPosts } from "@/lib/posts/queries";
import { getAdminProjectCounts, getAdminProjects } from "@/lib/projects/queries";
import { skillGroups } from "@/data/portfolio";

export default async function AdminDashboardPage() {
  const [projectCounts, projects, postCounts, posts] = await Promise.all([
    getAdminProjectCounts(), getAdminProjects(), getAdminPostCounts(), getAdminPosts(),
  ]);
  const stats = [
    ["Projects", projectCounts.total.toString(), `${projectCounts.published} published`, "folder"],
    ["Articles", postCounts.total.toString(), `${postCounts.published} published`, "file"],
    ["Draft content", (projectCounts.draft + postCounts.draft).toString(), "Awaiting review", "edit"],
    ["Skill groups", skillGroups.length.toString(), "Homepage CMS scheduled", "layers"],
  ];
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">CMS overview</span><h1>Dashboard</h1><p>Manage portfolio projects, long-form articles and the next content milestones.</p></div><div className="admin-actions"><Link href="/admin/posts/new" className="button button-primary"><Icon name="plus" size={17}/> New post</Link><Link href="/" className="button button-secondary"><Icon name="eye" size={17}/> View website</Link></div></div>
      <div className="admin-stat-grid">{stats.map(([label,value,note,icon]) => <article key={label}><span className="icon-box small"><Icon name={icon} size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}</div>
      <div className="admin-grid-two">
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Recent content</span><h2>Publishing library</h2></div></div><div className="content-table">{[...posts.slice(0,3).map((post) => ({ id: post.id, title: post.title, note: `${post.categoryLabel} · ${post.readTimeMinutes} min`, status: post.publicationStatus, href: `/admin/posts/${post.id}/edit`, icon: "file" })), ...projects.slice(0,2).map((project) => ({ id: project.id, title: project.title, note: project.category, status: project.publicationStatus, href: `/admin/projects/${project.id}/edit`, icon: "folder" }))].map((item) => <div className="content-row" key={`${item.icon}-${item.id}`}><span className="table-thumb"><Icon name={item.icon} size={18}/></span><div><strong>{item.title}</strong><small>{item.note}</small></div><span className={`publication-badge publication-${item.status}`}>{item.status}</span><Link aria-label={`Edit ${item.title}`} href={item.href}><Icon name="edit" size={17}/></Link></div>)}</div></section>
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Release progress</span><h2>CMS readiness</h2></div></div><div className="readiness-score"><div className="score-ring"><span>68%</span></div><p>Projects and blog publishing are functional. Media, homepage content and contact operations remain scheduled.</p></div><ul className="readiness-list"><li className="done"><Icon name="check" size={14}/> Authentication and RLS</li><li className="done"><Icon name="check" size={14}/> Project CMS</li><li className="done"><Icon name="check" size={14}/> Blog editor and publishing</li><li className="done"><Icon name="check" size={14}/> Categories, tags and revisions</li><li><span/> Media library and CV</li></ul></section>
      </div>
      <section className="admin-panel quick-actions-panel"><div className="panel-head"><div><span className="eyebrow">Quick actions</span><h2>Continue managing content</h2></div></div><div className="quick-action-grid"><Link href="/admin/posts/new"><Icon name="plus"/><span><strong>Write an article</strong><small>Create a draft with the rich editor</small></span></Link><Link href="/admin/posts?status=draft"><Icon name="edit"/><span><strong>Review post drafts</strong><small>Preview and prepare for publishing</small></span></Link><Link href="/admin/posts/taxonomies"><Icon name="layers"/><span><strong>Manage taxonomies</strong><small>Categories and controlled tags</small></span></Link><Link href="/blog"><Icon name="eye"/><span><strong>Public insights</strong><small>Check published article pages</small></span></Link></div></section>
    </>
  );
}
