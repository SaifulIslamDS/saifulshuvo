import Link from "next/link";
import { BlogCard } from "@/components/BlogCard";
import { Icon } from "@/components/Icon";
import type { PaginatedPosts } from "@/lib/posts/queries";
import type { PostCategory, PostTag } from "@/types/post";

function pageHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return `${basePath}${suffix ? `?${suffix}` : ""}`;
}

export function BlogListing({
  result,
  categories,
  tags,
  query,
  category,
  tag,
  basePath = "/blog",
}: {
  result: PaginatedPosts;
  categories: PostCategory[];
  tags: PostTag[];
  query?: string;
  category?: string;
  tag?: string;
  basePath?: string;
}) {
  const featured = !query && !category && !tag ? result.posts.find((post) => post.featured) : undefined;
  const regular = featured ? result.posts.filter((post) => post.id !== featured.id) : result.posts;
  return (
    <>
      <section className="blog-filter-shell">
        <form className="blog-filter-bar" method="get" action={basePath}>
          <div className="search-field"><Icon name="search" size={17} /><input name="q" defaultValue={query ?? ""} placeholder="Search articles, categories or tags..." /></div>
          {basePath === "/blog" ? (
            <select name="category" defaultValue={category ?? ""}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          ) : null}
          <button className="button button-secondary" type="submit">Search</button>
          {(query || category || tag) ? <Link className="button button-ghost" href="/blog">Reset</Link> : null}
        </form>
        {tags.length ? <div className="blog-tag-cloud">{tags.slice(0, 12).map((item) => <Link className={tag === item.slug ? "active" : ""} key={item.id} href={`/blog/tag/${item.slug}`}>#{item.name}</Link>)}</div> : null}
      </section>

      {featured ? <div className="blog-featured-wrap"><BlogCard post={featured} featured /></div> : null}
      {regular.length ? (
        <div className="blog-grid">{regular.map((post) => <BlogCard key={post.id} post={post} />)}</div>
      ) : featured ? null : (
        <div className="blog-empty-state"><Icon name="file" size={38}/><h2>No published articles found</h2><p>Try another filter or return after the next article is published.</p><Link href="/blog" className="button button-secondary">View all insights</Link></div>
      )}

      {result.pageCount > 1 ? (
        <nav className="blog-pagination" aria-label="Blog pagination">
          {result.page > 1 ? <Link href={pageHref(basePath, { q: query, category, tag }, result.page - 1)}>← Previous</Link> : <span />}
          <span>Page {result.page} of {result.pageCount}</span>
          {result.page < result.pageCount ? <Link href={pageHref(basePath, { q: query, category, tag }, result.page + 1)}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </>
  );
}
