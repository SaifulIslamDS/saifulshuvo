import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getAdminProjectCounts, getAdminProjects } from "@/lib/projects/queries";
import { publicationStatusLabel } from "@/types/project";
import type { ProjectPublicationStatus } from "@/types/project";
import {
  archiveProjectAction,
  deleteProjectAction,
  moveToDraftAction,
  publishProjectAction,
  restoreProjectAction,
  toggleFeaturedProjectAction,
} from "./actions";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; success?: string; error?: string }>;
};

export default async function AdminProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const validStatuses = new Set(["all", "draft", "published", "archived"]);
  const status = validStatuses.has(params.status ?? "")
    ? (params.status as ProjectPublicationStatus | "all")
    : "all";
  const [projects, counts] = await Promise.all([
    getAdminProjects({ query: params.q, status }),
    getAdminProjectCounts(),
  ]);

  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Project CMS</span><h1>Projects</h1><p>Create, review, publish and maintain portfolio case studies.</p></div>
        <Link className="button button-primary" href="/admin/projects/new"><Icon name="plus" size={17}/> Add project</Link>
      </div>
      <AdminFlash success={params.success} error={params.error} />

      <div className="project-cms-stats">
        {[
          ["All projects", counts.total, "folder"],
          ["Published", counts.published, "eye"],
          ["Drafts", counts.draft, "edit"],
          ["Archived", counts.archived, "layers"],
        ].map(([label, value, icon]) => (
          <article key={String(label)}><Icon name={String(icon)} size={20}/><div><strong>{String(value)}</strong><span>{String(label)}</span></div></article>
        ))}
      </div>

      <section className="admin-panel">
        <form className="toolbar project-toolbar" method="get">
          <div className="search-field"><Icon name="search" size={17}/><input name="q" defaultValue={params.q ?? ""} placeholder="Search title, category or slug..." /></div>
          <select name="status" defaultValue={status}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button className="button button-secondary" type="submit">Filter</button>
          {(params.q || status !== "all") ? <Link className="button button-ghost" href="/admin/projects">Reset</Link> : null}
        </form>

        {projects.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table project-cms-table">
              <thead><tr><th>Project</th><th>Publication</th><th>Project state</th><th>Order</th><th>Featured</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td><div className="table-project"><span className={`table-thumb accent-${project.accent}`}><Icon name="folder" size={18}/></span><div><strong>{project.title}</strong><small>{project.category} · /{project.slug}</small></div></div></td>
                    <td><span className={`publication-badge publication-${project.publicationStatus}`}>{publicationStatusLabel(project.publicationStatus)}</span></td>
                    <td><span className={`status status-${project.projectState.replaceAll("_", "-")}`}>{project.status}</span></td>
                    <td>{project.sortOrder}</td>
                    <td>
                      <form action={toggleFeaturedProjectAction.bind(null, project.id, !project.featured)}>
                        <button className={`feature-toggle ${project.featured ? "active" : ""}`} type="submit" title={project.featured ? "Remove from homepage" : "Feature on homepage"} aria-label={project.featured ? "Remove from featured projects" : "Add to featured projects"}>★</button>
                      </form>
                    </td>
                    <td><time dateTime={project.updatedAt}>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString("en-GB") : "—"}</time><small className="table-version">v{project.version}</small></td>
                    <td>
                      <div className="project-row-actions">
                        <Link href={`/admin/projects/${project.id}/preview`} title="Preview" aria-label={`Preview ${project.title}`}><Icon name="eye" size={16}/></Link>
                        <Link href={`/admin/projects/${project.id}/edit`} title="Edit" aria-label={`Edit ${project.title}`}><Icon name="edit" size={16}/></Link>
                        {project.publicationStatus === "draft" ? (
                          <form action={publishProjectAction.bind(null, project.id)}><button type="submit" title="Publish">Publish</button></form>
                        ) : null}
                        {project.publicationStatus === "published" ? (
                          <form action={moveToDraftAction.bind(null, project.id)}><button type="submit" title="Move to draft">Draft</button></form>
                        ) : null}
                        {project.publicationStatus !== "archived" ? (
                          <form action={archiveProjectAction.bind(null, project.id)}><ConfirmSubmitButton className="row-action-warning" message={`Archive “${project.title}”? It will be removed from the public site.`}>Archive</ConfirmSubmitButton></form>
                        ) : (
                          <>
                            <form action={restoreProjectAction.bind(null, project.id)}><button type="submit">Restore</button></form>
                            <form action={deleteProjectAction.bind(null, project.id)}><ConfirmSubmitButton className="row-action-danger" message={`Permanently delete “${project.title}”? This cannot be undone.`}>Delete</ConfirmSubmitButton></form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="project-empty-state"><Icon name="folder" size={34}/><h2>No projects found</h2><p>Change the filter or create a new portfolio project.</p><Link className="button button-primary" href="/admin/projects/new">Create project</Link></div>
        )}
      </section>
    </>
  );
}
