import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { PostForm } from "@/components/admin/PostForm";
import { getAdminPostById, getPostTaxonomies } from "@/lib/posts/queries";
import { updatePostAction } from "../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string; error?: string }> };
export default async function EditPostPage({ params, searchParams }: Props) {
  const [{ id }, query, taxonomies] = await Promise.all([params, searchParams, getPostTaxonomies()]);
  const post = await getAdminPostById(id);
  if (!post) notFound();
  return <><div className="admin-page-head project-editor-head"><div><Link className="admin-back-link" href="/admin/posts">← Posts</Link><span className="eyebrow">Blog editor</span><h1>{post.title}</h1><p>Update article content, taxonomies, revisions and search metadata.</p></div><div className="admin-actions"><Link href={`/admin/posts/${post.id}/revisions`} className="button button-ghost">Revisions</Link><Link href={`/admin/posts/${post.id}/preview`} className="button button-secondary">Preview</Link></div></div><AdminFlash success={query.success} error={query.error}/><PostForm post={post} categories={taxonomies.categories} tags={taxonomies.tags} action={updatePostAction.bind(null, post.id)} submitLabel="Save changes"/></>;
}
