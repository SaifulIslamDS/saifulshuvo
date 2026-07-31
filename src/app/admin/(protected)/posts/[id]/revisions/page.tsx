import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getAdminPostById, getPostRevisions } from "@/lib/posts/queries";
import { restorePostRevisionAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };
function snapshotTitle(snapshot: Record<string, unknown>): string { return typeof snapshot.title === "string" ? snapshot.title : "Untitled revision"; }
export default async function PostRevisionsPage({ params }: Props) {
  const { id } = await params;
  const [post, revisions] = await Promise.all([getAdminPostById(id), getPostRevisions(id)]);
  if (!post) notFound();
  return <><div className="admin-page-head"><div><Link className="admin-back-link" href={`/admin/posts/${id}/edit`}>← Post editor</Link><span className="eyebrow">Version history</span><h1>{post.title}</h1><p>Restore an earlier snapshot as a new draft version without deleting current history.</p></div></div><section className="admin-panel revision-panel"><div className="revision-current"><Icon name="file" size={20}/><div><strong>Current version {post.version}</strong><span>Updated {new Date(post.updatedAt).toLocaleString("en-GB")}</span></div><span className={`publication-badge publication-${post.publicationStatus}`}>{post.publicationStatus}</span></div><div className="revision-list">{revisions.length ? revisions.map((revision) => <article key={revision.id}><div><span>Version {revision.version}</span><h2>{snapshotTitle(revision.snapshot)}</h2><small>Captured {new Date(revision.createdAt).toLocaleString("en-GB")}</small></div><div className="revision-actions"><Link href={`/admin/posts/${post.id}/revisions/${revision.id}`}>Preview</Link><form action={restorePostRevisionAction.bind(null, post.id, revision.id)}><ConfirmSubmitButton message={`Restore version ${revision.version} as a new draft?`}>Restore</ConfirmSubmitButton></form></div></article>) : <div className="project-empty-state"><Icon name="layers" size={32}/><h2>No earlier revisions</h2><p>Revision snapshots appear after meaningful article edits.</p></div>}</div></section></>;
}
