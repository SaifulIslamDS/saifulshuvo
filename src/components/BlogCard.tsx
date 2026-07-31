import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { BlogPost } from "@/types/post";

function formatDate(value?: string): string {
  if (!value) return "Unscheduled";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`blog-card ${featured ? "blog-card-featured" : ""}`}>
      <Link href={`/blog/${post.slug}`} className={`blog-card-visual accent-${post.category?.accent ?? "cyan"}`} aria-label={`Read ${post.title}`}>
        {post.featuredImageUrl ? <img src={post.featuredImageUrl} alt={post.featuredImageAlt ?? ""} loading="lazy" decoding="async" /> : <Icon name="file" size={featured ? 44 : 34} />}
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-taxonomy">
          {post.category ? <Link href={`/blog/category/${post.category.slug}`}>{post.category.name}</Link> : <span>{post.categoryLabel}</span>}
          {post.featured ? <span className="featured-label">Featured</span> : null}
        </div>
        <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        <div className="blog-card-meta">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>{post.readTimeMinutes} min read</span>
        </div>
        {post.tags.length ? (
          <div className="blog-card-tags">
            {post.tags.slice(0, 4).map((tag) => <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>#{tag.name}</Link>)}
          </div>
        ) : null}
        <Link href={`/blog/${post.slug}`} className="text-link">Read article <Icon name="arrow" size={17} /></Link>
      </div>
    </article>
  );
}
