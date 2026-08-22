"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BlogCard } from "@/components/BlogCard";
import { Icon } from "@/components/Icon";
import type { BlogPost, PostCategory, PostTag } from "@/types/post";

const PAGE_SIZE = 9;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function searchMatches(post: BlogPost, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  const haystack = [
    post.title,
    post.excerpt,
    post.categoryLabel,
    ...post.tags.map((tag) => tag.name),
    post.contentHtml.replace(/<[^>]*>/g, " "),
  ].join(" ").toLowerCase();
  return haystack.includes(needle);
}

function readUrlState() {
  if (typeof window === "undefined") return { q: "", category: "", page: 1 };
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    page: Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  };
}

export function BlogListing({
  posts,
  categories,
  tags,
  fixedCategory,
  fixedTag,
  basePath = "/blog",
}: {
  posts: BlogPost[];
  categories: PostCategory[];
  tags: PostTag[];
  fixedCategory?: string;
  fixedTag?: string;
  basePath?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(fixedCategory || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const sync = () => {
      const state = readUrlState();
      setQuery(state.q);
      if (!fixedCategory) setCategory(state.category);
      setPage(state.page);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [fixedCategory]);

  function updateUrl(next: { q?: string; category?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextQuery = next.q ?? query;
    const nextCategory = fixedCategory || (next.category ?? category);
    const nextPage = next.page ?? page;
    if (nextQuery) params.set("q", nextQuery);
    if (!fixedCategory && nextCategory) params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    window.history.pushState(null, "", `${basePath}${suffix ? `?${suffix}` : ""}`);
  }

  const filtered = useMemo(() => posts.filter((post) => {
    if (fixedCategory && post.category?.slug !== fixedCategory) return false;
    if (fixedTag && !post.tags.some((tag) => tag.slug === fixedTag)) return false;
    if (!fixedCategory && category && post.category?.slug !== category) return false;
    return searchMatches(post, query);
  }), [posts, fixedCategory, fixedTag, category, query]);

  const noFilters = !query && !category && !fixedCategory && !fixedTag;
  const featured = noFilters ? filtered.find((post) => post.featured) : undefined;
  const regular = featured ? filtered.filter((post) => post.id !== featured.id) : filtered;
  const pageCount = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = regular.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") || "").trim();
    const nextCategory = fixedCategory ? fixedCategory : String(formData.get("category") || "");
    setQuery(nextQuery);
    if (!fixedCategory) setCategory(nextCategory);
    setPage(1);
    updateUrl({ q: nextQuery, category: nextCategory, page: 1 });
  }

  function goToPage(nextPage: number) {
    const target = Math.max(1, Math.min(nextPage, pageCount));
    setPage(target);
    updateUrl({ page: target });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <section className="blog-filter-shell">
        <form className="blog-filter-bar" onSubmit={onSearch}>
          <div className="search-field"><Icon name="search" size={17} /><input name="q" defaultValue={query} key={`q-${query}`} placeholder="Search articles, categories or tags..." /></div>
          {!fixedCategory && basePath === "/blog" ? (
            <select name="category" defaultValue={category} key={`category-${category}`}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
            </select>
          ) : null}
          <button className="button button-secondary" type="submit">Search</button>
          {(query || category || fixedCategory || fixedTag) ? <Link className="button button-ghost" href="/blog">Reset</Link> : null}
        </form>
        {tags.length ? <div className="blog-tag-cloud">{tags.slice(0, 12).map((item) => <Link className={fixedTag === item.slug ? "active" : ""} key={item.id} href={`/blog/tag/${item.slug}`}>#{item.name}</Link>)}</div> : null}
      </section>

      {featured ? <div className="blog-featured-wrap"><BlogCard post={featured} featured /></div> : null}
      {paged.length ? (
        <div className="blog-grid">{paged.map((post) => <BlogCard key={post.id} post={post} />)}</div>
      ) : featured ? null : (
        <div className="blog-empty-state"><Icon name="file" size={38}/><h2>No published articles found</h2><p>Try another filter or return after the next article is published.</p><Link href="/blog" className="button button-secondary">View all insights</Link></div>
      )}

      {pageCount > 1 ? (
        <nav className="blog-pagination" aria-label="Blog pagination">
          {safePage > 1 ? <button type="button" onClick={() => goToPage(safePage - 1)}>← Previous</button> : <span />}
          <span>Page {safePage} of {pageCount}</span>
          {safePage < pageCount ? <button type="button" onClick={() => goToPage(safePage + 1)}>Next →</button> : <span />}
        </nav>
      ) : null}
    </>
  );
}
