import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { getAdminPostById } from "@/lib/posts/queries";

type Props = { params: Promise<{ id: string }> };
export default async function AdminPostPreviewPage({ params }: Props) {
  const { id } = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();
  return <><div className="preview-banner"><div><strong>Private preview</strong><span>This article is visible only inside the protected CMS.</span></div><Link href={`/admin/posts/${id}/edit`} className="button button-secondary">Back to editor</Link></div><div className="admin-post-preview"><PostArticle post={post} preview/></div></>;
}
