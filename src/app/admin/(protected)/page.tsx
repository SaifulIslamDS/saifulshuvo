import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getAdminPostCounts, getAdminPosts } from "@/lib/posts/queries";
import { getAdminProjectCounts, getAdminProjects } from "@/lib/projects/queries";
import { getAdminCvDocuments, getAdminMediaAssets } from "@/lib/media/queries";
import { getExperienceEntries, getHomepageContent, getSkillGroups } from "@/lib/profile/queries";

export default async function AdminDashboardPage() {
  const [projectCounts, projects, postCounts, posts, mediaAssets, cvDocuments, groups, experiences, homepage] = await Promise.all([
    getAdminProjectCounts(), getAdminProjects(), getAdminPostCounts(), getAdminPosts(), getAdminMediaAssets({ status: "active" }), getAdminCvDocuments(), getSkillGroups({ admin: true }), getExperienceEntries({ admin: true }), getHomepageContent(),
  ]);
  const skills = groups.flatMap((group) => group.skills);
  const stats = [
    ["Projects", projectCounts.total.toString(), `${projectCounts.published} published`, "folder"],
    ["Articles", postCounts.total.toString(), `${postCounts.published} published`, "file"],
    ["Skills", skills.length.toString(), `${skills.filter((skill) => skill.active).length} visible`, "layers"],
    ["Experience", experiences.length.toString(), `${experiences.filter((item) => item.active).length} visible`, "briefcase"],
    ["Media assets", mediaAssets.length.toString(), `${cvDocuments.length} CV version${cvDocuments.length === 1 ? "" : "s"}`, "image"],
  ];
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">CMS overview</span><h1>Dashboard</h1><p>Manage the portfolio homepage, professional profile, projects, articles and media from one secure workspace.</p></div><div className="admin-actions"><Link href="/admin/homepage" className="button button-primary"><Icon name="spark" size={17}/> Edit homepage</Link><Link href="/" className="button button-secondary"><Icon name="eye" size={17}/> View website</Link></div></div>
    <div className="admin-stat-grid dashboard-five-stats">{stats.map(([label,value,note,icon]) => <article key={label}><span className="icon-box small"><Icon name={icon} size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>)}</div>
    <div className="admin-grid-two">
      <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Recent content</span><h2>Publishing library</h2></div></div><div className="content-table">{[...posts.slice(0,3).map((post) => ({ id: post.id, title: post.title, note: `${post.categoryLabel} · ${post.readTimeMinutes} min`, status: post.publicationStatus, href: `/admin/posts/${post.id}/edit`, icon: "file" })), ...projects.slice(0,2).map((project) => ({ id: project.id, title: project.title, note: project.category, status: project.publicationStatus, href: `/admin/projects/${project.id}/edit`, icon: "folder" }))].map((item) => <div className="content-row" key={`${item.icon}-${item.id}`}><span className="table-thumb"><Icon name={item.icon} size={18}/></span><div><strong>{item.title}</strong><small>{item.note}</small></div><span className={`publication-badge publication-${item.status}`}>{item.status}</span><Link aria-label={`Edit ${item.title}`} href={item.href}><Icon name="edit" size={17}/></Link></div>)}</div></section>
      <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Release progress</span><h2>CMS readiness</h2></div></div><div className="readiness-score"><div className="score-ring"><span>88%</span></div><p>Homepage, profile content, publishing, projects, skills, experience, media and CV management are functional. Contact operations and final production optimisation remain.</p></div><ul className="readiness-list"><li className="done"><Icon name="check" size={14}/> Authentication and RLS</li><li className="done"><Icon name="check" size={14}/> Project and Blog CMS</li><li className="done"><Icon name="check" size={14}/> Media library and CV</li><li className="done"><Icon name="check" size={14}/> Homepage content CMS</li><li className="done"><Icon name="check" size={14}/> Skills and Experience CMS</li><li><span/> Contact inbox and notifications</li></ul><div className="version-note"><span>Homepage content v{homepage.version}</span><small>Each save increments the database content version.</small></div></section>
    </div>
    <section className="admin-panel quick-actions-panel"><div className="panel-head"><div><span className="eyebrow">Quick actions</span><h2>Continue managing content</h2></div></div><div className="quick-action-grid"><Link href="/admin/homepage"><Icon name="spark"/><span><strong>Edit homepage</strong><small>Hero, About, process, CTA and services</small></span></Link><Link href="/admin/skills"><Icon name="layers"/><span><strong>Manage skills</strong><small>Groups, evidence and visibility</small></span></Link><Link href="/admin/experience/new"><Icon name="briefcase"/><span><strong>Add experience</strong><small>Build the public professional timeline</small></span></Link><Link href="/admin/media"><Icon name="image"/><span><strong>Manage media</strong><small>Images, project assets and CV versions</small></span></Link></div></section>
  </>;
}
