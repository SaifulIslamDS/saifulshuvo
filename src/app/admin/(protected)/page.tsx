import Link from "next/link";
import { Icon } from "@/components/Icon";
import { articles, projects, skillGroups } from "@/data/portfolio";

export default function AdminDashboardPage() {
  const cards = [
    ["Projects", projects.length.toString(), "+2 this quarter", "folder"],
    ["Published posts", "0", `${articles.length} drafts prepared`, "file"],
    ["Skills", skillGroups.reduce((sum, group) => sum + group.skills.length, 0).toString(), "Across 6 categories", "layers"],
    ["Security status", "Protected", "Google OAuth + allow-list", "shield"],
  ];

  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Overview</span><h1>Welcome back, Saiful</h1><p>Your admin session is protected. Content CRUD will be connected incrementally from this foundation.</p></div>
        <div className="admin-actions"><button className="button button-secondary"><Icon name="eye" size={17}/> Preview</button><button className="button button-primary"><Icon name="plus" size={17}/> New project</button></div>
      </div>

      <div className="admin-notice"><Icon name="spark" size={21}/><div><strong>CMS foundation is active.</strong><p>Google-only authentication, protected admin routing, database schema and RLS policies are now prepared. Project and post CRUD remain the next milestones.</p></div></div>

      <div className="admin-stat-grid">
        {cards.map(([label, value, note, icon]) => <article key={label}><span className="icon-box"><Icon name={icon} size={21}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Recent content</span><h2>Project library</h2></div><Link href="/admin/projects">View all</Link></div>
          <div className="content-table">
            {projects.slice(0, 5).map((project) => <div className="content-row" key={project.slug}><span className={`table-thumb accent-${project.accent}`}><Icon name="folder" size={18}/></span><div><strong>{project.title}</strong><small>{project.category}</small></div><span className={`status status-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span><button aria-label={`Edit ${project.title}`}><Icon name="edit" size={17}/></button></div>)}
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Publishing health</span><h2>Portfolio readiness</h2></div></div>
          <div className="readiness-score"><div className="score-ring"><span>88%</span></div><p>Your core content structure is ready. Complete the identity and proof assets before production launch.</p></div>
          <ul className="readiness-list">
            <li className="done"><Icon name="check" size={16}/> Hero positioning and professional summary</li>
            <li className="done"><Icon name="check" size={16}/> Skills and project structure</li>
            <li><span /> Upload final CV</li>
            <li><span /> Add professional profile photo</li>
            <li><span /> Connect contact form and analytics</li>
          </ul>
        </section>
      </div>

      <section className="admin-panel quick-actions-panel">
        <div className="panel-head"><div><span className="eyebrow">Shortcuts</span><h2>Quick actions</h2></div></div>
        <div className="quick-action-grid">
          <Link href="/admin/projects"><Icon name="plus"/><span><strong>Add a project</strong><small>Create a new portfolio case study</small></span></Link>
          <Link href="/admin/posts"><Icon name="file"/><span><strong>Write an article</strong><small>Prepare a blog post or learning note</small></span></Link>
          <Link href="/admin/skills"><Icon name="layers"/><span><strong>Update skills</strong><small>Organize current and learning capabilities</small></span></Link>
          <Link href="/admin/settings"><Icon name="settings"/><span><strong>Website settings</strong><small>Update profile, links, SEO and availability</small></span></Link>
        </div>
      </section>
    </>
  );
}
