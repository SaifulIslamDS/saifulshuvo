import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getAdminProjectCounts, getAdminProjects } from "@/lib/projects/queries";
import { articles, skillGroups } from "@/data/portfolio";

export default async function AdminDashboardPage() {
  const [counts, projects] = await Promise.all([getAdminProjectCounts(), getAdminProjects()]);
  const stats = [
    ["Projects", counts.total.toString(), `${counts.published} published`, "folder"],
    ["Draft projects", counts.draft.toString(), "Awaiting review", "edit"],
    ["Articles", articles.length.toString(), "Blog CMS next", "file"],
    ["Skill groups", skillGroups.length.toString(), "Static until v0.5.0", "layers"],
  ];
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">CMS overview</span><h1>Dashboard</h1><p>Manage the project portfolio and review the next content milestones.</p></div><div className="admin-actions"><Link href="/admin/projects/new" className="button button-primary"><Icon name="plus" size={17}/> Add project</Link><Link href="/" className="button button-secondary"><Icon name="eye" size={17}/> View website</Link></div></div>
      <div className="admin-stat-grid">{stats.map(([label,value,note,icon]) => <article key={label}><span className="icon-box small"><Icon name={icon} size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}</div>
      <div className="admin-grid-two">
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Recent content</span><h2>Project library</h2></div><Link href="/admin/projects">View all</Link></div><div className="content-table">{projects.slice(0,5).map((project) => <div className="content-row" key={project.id}><span className={`table-thumb accent-${project.accent}`}><Icon name="folder" size={18}/></span><div><strong>{project.title}</strong><small>{project.category}</small></div><span className={`publication-badge publication-${project.publicationStatus}`}>{project.publicationStatus}</span><Link aria-label={`Edit ${project.title}`} href={`/admin/projects/${project.id}/edit`}><Icon name="edit" size={17}/></Link></div>)}</div></section>
        <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Release progress</span><h2>CMS readiness</h2></div></div><div className="readiness-score"><div className="score-ring"><span>52%</span></div><p>Project CRUD is functional. Posts, skills, settings and media remain scheduled.</p></div><ul className="readiness-list"><li className="done"><Icon name="check" size={14}/> Authentication and RLS</li><li className="done"><Icon name="check" size={14}/> Project create, edit and preview</li><li className="done"><Icon name="check" size={14}/> Publish, archive and delete</li><li><span/> Blog CMS</li><li><span/> Media library</li></ul></section>
      </div>
      <section className="admin-panel quick-actions-panel"><div className="panel-head"><div><span className="eyebrow">Quick actions</span><h2>Continue managing content</h2></div></div><div className="quick-action-grid"><Link href="/admin/projects/new"><Icon name="plus"/><span><strong>Add a project</strong><small>Create a new portfolio case study</small></span></Link><Link href="/admin/projects?status=draft"><Icon name="edit"/><span><strong>Review drafts</strong><small>Prepare content for publishing</small></span></Link><Link href="/admin/projects?status=archived"><Icon name="layers"/><span><strong>Archived projects</strong><small>Restore or permanently delete</small></span></Link><Link href="/projects"><Icon name="eye"/><span><strong>Public portfolio</strong><small>Check published project pages</small></span></Link></div></section>
    </>
  );
}
