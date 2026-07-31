import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { BlogPost } from "@/types/post";

function formatDate(value?: string): string {
  if (!value) return "Not published";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function PostArticle({ post, preview = false }: { post: BlogPost; preview?: boolean }) {
  return (
    <article className="post-article">
      <header className="post-hero">
        <div className="post-breadcrumb"><Link href="/blog">Insights</Link><span>/</span><span>{post.categoryLabel}</span></div>
        <div className="post-taxonomy-row">
          {post.category ? <Link href={`/blog/category/${post.category.slug}`}>{post.category.name}</Link> : <span>{post.categoryLabel}</span>}
          {preview ? <span className={`publication-badge publication-${post.publicationStatus}`}>{post.publicationStatus}</span> : null}
        </div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className="post-byline">
          <span className="post-author-mark">SI</span>
          <div><strong>Saiful Islam</strong><span>{formatDate(post.publishedAt)} · {post.readTimeMinutes} min read</span></div>
        </div>
        {post.featuredImageUrl ? <img className="post-featured-image" src={post.featuredImageUrl} alt={post.featuredImageAlt ?? ""} /> : null}
      </header>
      <div className="post-layout">
        <main className="post-content rich-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        <aside className="post-sidebar-card">
          <span className="eyebrow">Article details</span>
          <dl>
            <div><dt>Category</dt><dd>{post.categoryLabel}</dd></div>
            <div><dt>Reading time</dt><dd>{post.readTimeMinutes} minutes</dd></div>
            <div><dt>Version</dt><dd>{post.version}</dd></div>
            <div><dt>Updated</dt><dd>{formatDate(post.updatedAt)}</dd></div>
          </dl>
          {post.tags.length ? <div className="post-sidebar-tags">{post.tags.map((tag) => <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>#{tag.name}</Link>)}</div> : null}
          <Link href="/contact" className="button button-primary">Discuss this topic <Icon name="arrow" size={17}/></Link>
        </aside>
      </div>
    </article>
  );
}
