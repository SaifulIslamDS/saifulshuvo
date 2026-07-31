import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getAdminPostById, getPostRevisions } from "@/lib/posts/queries";
import type { BlogPost } from "@/types/post";
import { restorePostRevisionAction } from "../../../actions";

type Props = { params: Promise<{ id: string; revisionId: string }> };

function stringValue(value: unknown, fallback: string): string { return typeof value === "string" ? value : fallback; }
function numberValue(value: unknown, fallback: number): number { return typeof value === "number" ? value : fallback; }

export default async function RevisionPreviewPage({ params }: Props) {
  const { id, revisionId } = await params;
  const [post, revisions] = await Promise.all([getAdminPostById(id), getPostRevisions(id)]);
  if (!post) notFound();
  const revision = revisions.find((item) => String(item.id) === revisionId);
  if (!revision) notFound();
  const snapshot = revision.snapshot;
  const preview: BlogPost = {
    ...post,
    slug: stringValue(snapshot.slug, post.slug),
    title: stringValue(snapshot.title, post.title),
    excerpt: stringValue(snapshot.excerpt, post.excerpt),
    contentHtml: stringValue(snapshot.content, post.contentHtml),
    publicationStatus: "draft",
    readTimeMinutes: numberValue(snapshot.read_time_minutes, post.readTimeMinutes),
    featured: Boolean(snapshot.is_featured),
    sortOrder: numberValue(snapshot.sort_order, post.sortOrder),
    version: revision.version,
    featuredImageUrl: stringValue(snapshot.featured_image_url, "") || undefined,
    seoTitle: stringValue(snapshot.seo_title, "") || undefined,
    seoDescription: stringValue(snapshot.seo_description, "") || undefined,
    publishedAt: stringValue(snapshot.published_at, "") || undefined,
    updatedAt: stringValue(snapshot.updated_at, revision.createdAt),
  };
  return (
    <>
      <div className="preview-banner"><div><strong>Revision {revision.version} preview</strong><span>Captured {new Date(revision.createdAt).toLocaleString("en-GB")}</span></div><div className="admin-actions"><Link href={`/admin/posts/${id}/revisions`} className="button button-secondary">Back to revisions</Link><form action={restorePostRevisionAction.bind(null, id, revision.id)}><ConfirmSubmitButton className="button button-primary" message={`Restore version ${revision.version} as a new draft?`}>Restore revision</ConfirmSubmitButton></form></div></div>
      <div className="admin-post-preview"><PostArticle post={preview} preview/></div>
    </>
  );
}
