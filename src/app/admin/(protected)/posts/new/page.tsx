import Link from "next/link";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { PostForm } from "@/components/admin/PostForm";
import { getPostTaxonomies } from "@/lib/posts/queries";
import { createPostAction } from "../actions";
import { getAdminImageAssets } from "@/lib/media/queries";

type Props = { searchParams: Promise<{ error?: string }> };
export default async function NewPostPage({ searchParams }: Props) {
  const [params, taxonomies, mediaAssets] = await Promise.all([searchParams, getPostTaxonomies(), getAdminImageAssets()]);
  return <><div className="admin-page-head project-editor-head"><div><Link className="admin-back-link" href="/admin/posts">← Posts</Link><span className="eyebrow">New article</span><h1>Create post</h1><p>Write as a draft, review the SEO preview and publish when ready.</p></div></div><AdminFlash error={params.error}/><PostForm categories={taxonomies.categories} tags={taxonomies.tags} action={createPostAction} submitLabel="Create post" mediaAssets={mediaAssets}/></>;
}
