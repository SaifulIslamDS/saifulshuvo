import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { BlogPost, PostCategory, PostTag } from "@/types/post";
import type { MediaAsset } from "@/types/media";

function dateTimeLocal(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PostForm({
  post,
  categories,
  tags,
  action,
  submitLabel,
  mediaAssets,
}: {
  post?: BlogPost;
  categories: PostCategory[];
  tags: PostTag[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  mediaAssets: MediaAsset[];
}) {
  const selectedTags = new Set(post?.tags.map((tag) => tag.id) ?? []);
  return (
    <form action={action} className="post-editor-layout">
      <div className="post-editor-main">
        <section className="admin-panel project-form-section">
          <div className="panel-head"><div><span className="eyebrow">Article identity</span><h2>Title and summary</h2></div></div>
          <div className="form-row">
            <label>Post title<input name="title" required minLength={5} maxLength={180} defaultValue={post?.title ?? ""} placeholder="Example: Business-First Data Analytics" /></label>
            <label>URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={post?.slug ?? ""} placeholder="business-first-data-analytics" /></label>
          </div>
          <label>Excerpt<textarea name="excerpt" rows={4} minLength={30} maxLength={360} defaultValue={post?.excerpt ?? ""} placeholder="A concise summary for cards, search results and social previews." /></label>
        </section>

        <section className="admin-panel project-form-section post-content-panel">
          <div className="panel-head"><div><span className="eyebrow">Rich content</span><h2>Article body</h2></div><small>Reading time is calculated automatically.</small></div>
          <RichTextEditor initialHtml={post?.contentHtml} initialJson={post?.contentJson} />
        </section>

        <section className="admin-panel project-form-section">
          <div className="panel-head"><div><span className="eyebrow">Search visibility</span><h2>SEO and sharing</h2></div></div>
          <div className="form-row">
            <label>SEO title<input name="seo_title" maxLength={70} defaultValue={post?.seoTitle ?? ""} placeholder="Leave blank to use post title" /></label>
            <label>Canonical URL<input name="canonical_url" type="url" defaultValue={post?.canonicalUrl ?? ""} placeholder="https://saifulshuvo.com/blog/..." /></label>
          </div>
          <label>Meta description<textarea name="seo_description" rows={3} maxLength={170} defaultValue={post?.seoDescription ?? ""} placeholder="Describe the article clearly in 140–160 characters." /></label>
          <div className="form-row">
            <label>Featured image from media library<select name="featured_image_asset_id" defaultValue={post?.featuredImageAssetId ?? ""}><option value="">No library image</option>{mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName} · {asset.purpose}</option>)}</select></label>
            <label>Open Graph image from media library<select name="og_image_asset_id" defaultValue={post?.ogImageAssetId ?? ""}><option value="">Use featured image</option>{mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName} · {asset.purpose}</option>)}</select></label>
          </div>
          <div className="form-row">
            <label>External featured image URL<input name="featured_image_url" type="url" defaultValue={post?.featuredImageAssetId ? "" : post?.featuredImageUrl ?? ""} placeholder="Optional fallback URL" /></label>
            <label>External Open Graph image URL<input name="og_image_url" type="url" defaultValue={post?.ogImageAssetId ? "" : post?.ogImageUrl ?? ""} placeholder="Optional fallback URL" /></label>
          </div>
        </section>
      </div>

      <aside className="post-editor-sidebar">
        <section className="admin-panel project-publish-card post-publish-card">
          <div><span className="eyebrow">Publishing</span><h2>Post settings</h2></div>
          <label>Publication status
            <select name="publication_status" defaultValue={post?.publicationStatus ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>Category
            <select name="category_id" required defaultValue={post?.category?.id ?? ""}>
              <option value="" disabled>Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>Publish time<input name="published_at" type="datetime-local" defaultValue={dateTimeLocal(post?.publishedAt)} /><small>Future time creates a scheduled article when status is Published.</small></label>
          <label>Display order<input name="sort_order" type="number" min={0} step={10} defaultValue={post?.sortOrder ?? 100} /></label>
          <label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked={post?.featured ?? false} /><span><strong>Featured article</strong><small>Prioritise this post on the blog and homepage.</small></span></label>
          <div className="post-tags-fieldset">
            <div><strong>Tags</strong><Link href="/admin/posts/taxonomies">Manage</Link></div>
            <div className="post-tag-options">
              {tags.length ? tags.map((tag) => (
                <label key={tag.id}><input name="tag_ids" type="checkbox" value={tag.id} defaultChecked={selectedTags.has(tag.id)} /><span>{tag.name}</span></label>
              )) : <small>No tags yet. Create them in Taxonomies.</small>}
            </div>
          </div>
          <div className="project-form-actions">
            <SubmitButton pendingLabel="Saving article…"><Icon name="check" size={17} /> {submitLabel}</SubmitButton>
            <Link href="/admin/posts" className="button button-secondary">Cancel</Link>
          </div>
          {post ? (
            <div className="version-note">
              <span>Version {post.version} · {post.readTimeMinutes} min read</span>
              <small>Last updated {new Date(post.updatedAt).toLocaleString("en-GB")}</small>
              <Link href={`/admin/posts/${post.id}/revisions`}>View revision history</Link>
            </div>
          ) : null}
        </section>
      </aside>
    </form>
  );
}
