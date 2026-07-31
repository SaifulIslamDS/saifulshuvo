import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getAdminPostCounts, getAdminPosts } from "@/lib/posts/queries";
import { isPostScheduled, postPublicationStatusLabel } from "@/types/post";
import type { AdminPostStatusFilter } from "@/types/post";
import {
  archivePostAction,
  deletePostAction,
  movePostToDraftAction,
  publishPostAction,
  restorePostAction,
  toggleFeaturedPostAction,
} from "./actions";

type Props = { searchParams: Promise<{ q?: string; status?: string; success?: string; error?: string }> };

export default async function AdminPostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const validStatuses = new Set(["all", "draft", "published", "scheduled", "archived"]);
  const status = validStatuses.has(params.status ?? "") ? params.status as AdminPostStatusFilter : "all";
  const [posts, counts] = await Promise.all([
    getAdminPosts({ query: params.q, status }),
    getAdminPostCounts(),
  ]);
  return (
    <>
      <div className="admin-page-head">
        <div><span className="eyebrow">Blog CMS</span><h1>Posts</h1><p>Write, revise, optimise and publish long-form portfolio content.</p></div>
        <div className="admin-actions"><Link href="/admin/posts/taxonomies" className="button button-secondary">Taxonomies</Link><Link href="/admin/posts/new" className="button button-primary"><Icon name="plus" size={17}/> New post</Link></div>
      </div>
      <AdminFlash success={params.success} error={params.error} />
      <div className="project-cms-stats">
        {[["All posts", counts.total, "file"], ["Published", counts.published, "eye"], ["Scheduled", counts.scheduled, "layers"], ["Drafts", counts.draft, "edit"], ["Archived", counts.archived, "folder"]].map(([label, value, icon]) => (
          <article key={String(label)}><Icon name={String(icon)} size={20}/><div><strong>{String(value)}</strong><span>{String(label)}</span></div></article>
        ))}
      </div>
      <section className="admin-panel">
        <form className="toolbar project-toolbar" method="get">
          <div className="search-field"><Icon name="search" size={17}/><input name="q" defaultValue={params.q ?? ""} placeholder="Search title, category, tag or slug..." /></div>
          <select name="status" defaultValue={status}><option value="all">All statuses</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
          <button className="button button-secondary" type="submit">Filter</button>
          {(params.q || status !== "all") ? <Link className="button button-ghost" href="/admin/posts">Reset</Link> : null}
        </form>
        {posts.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table project-cms-table post-cms-table">
              <thead><tr><th>Article</th><th>Publication</th><th>Category</th><th>Read</th><th>Featured</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>{posts.map((post) => (
                <tr key={post.id}>
                  <td><div className="table-project"><span className={`table-thumb accent-${post.category?.accent ?? "cyan"}`}><Icon name="file" size={18}/></span><div><strong>{post.title}</strong><small>/{post.slug}{post.tags.length ? ` · ${post.tags.slice(0, 2).map((tag) => `#${tag.name}`).join(" ")}` : ""}</small></div></div></td>
                  <td><span className={`publication-badge publication-${isPostScheduled(post) ? "scheduled" : post.publicationStatus}`}>{isPostScheduled(post) ? "Scheduled" : postPublicationStatusLabel(post.publicationStatus)}</span></td>
                  <td>{post.categoryLabel}</td>
                  <td>{post.readTimeMinutes} min</td>
                  <td><form action={toggleFeaturedPostAction.bind(null, post.id, !post.featured)}><button className={`feature-toggle ${post.featured ? "active" : ""}`} type="submit" title={post.featured ? "Remove featured status" : "Feature article"}>★</button></form></td>
                  <td><time dateTime={post.updatedAt}>{new Date(post.updatedAt).toLocaleDateString("en-GB")}</time><small className="table-version">v{post.version}</small></td>
                  <td><div className="project-row-actions">
                    <Link href={`/admin/posts/${post.id}/preview`} title="Preview"><Icon name="eye" size={16}/></Link>
                    <Link href={`/admin/posts/${post.id}/edit`} title="Edit"><Icon name="edit" size={16}/></Link>
                    <Link href={`/admin/posts/${post.id}/revisions`} title="Revisions"><Icon name="layers" size={16}/></Link>
                    {post.publicationStatus === "draft" ? <form action={publishPostAction.bind(null, post.id)}><button type="submit">Publish</button></form> : null}
                    {post.publicationStatus === "published" ? <form action={movePostToDraftAction.bind(null, post.id)}><button type="submit">Draft</button></form> : null}
                    {post.publicationStatus !== "archived" ? (
                      <form action={archivePostAction.bind(null, post.id)}><ConfirmSubmitButton className="row-action-warning" message={`Archive “${post.title}”?`}>Archive</ConfirmSubmitButton></form>
                    ) : <><form action={restorePostAction.bind(null, post.id)}><button type="submit">Restore</button></form><form action={deletePostAction.bind(null, post.id)}><ConfirmSubmitButton className="row-action-danger" message={`Permanently delete “${post.title}”?`}>Delete</ConfirmSubmitButton></form></>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="project-empty-state"><Icon name="file" size={34}/><h2>No posts found</h2><p>Change the filter or create your first article.</p><Link href="/admin/posts/new" className="button button-primary">Create article</Link></div>}
      </section>
    </>
  );
}
