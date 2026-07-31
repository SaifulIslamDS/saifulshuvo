import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { mapCategoryRow, mapPostRow, mapRevisionRow, mapTagRow } from "@/lib/posts/post-mapper";
import { isPostScheduled } from "@/types/post";
import type { AdminPostStatusFilter, BlogPost, PostCategory, PostPublicationStatus, PostRevision, PostTag } from "@/types/post";

const postSelect = `
  id, slug, title, excerpt, content, content_json,
  publication_status, read_time_minutes, featured_image_url,
  seo_title, seo_description, canonical_url, og_image_url,
  is_featured, sort_order, version, published_at, archived_at,
  created_at, updated_at,
  category:post_categories(id, slug, name, description, accent, sort_order),
  post_tag_links(tag:post_tags(id, slug, name))
`;

export type PublicPostFilters = {
  query?: string;
  category?: string;
  tag?: string;
  featuredOnly?: boolean;
  limit?: number;
  page?: number;
  pageSize?: number;
};

export type PaginatedPosts = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function emptyPagination(filters?: PublicPostFilters): PaginatedPosts {
  const pageSize = filters?.pageSize ?? filters?.limit ?? 9;
  return { posts: [], total: 0, page: 1, pageSize, pageCount: 1 };
}

export async function getPublicPosts(filters?: PublicPostFilters): Promise<PaginatedPosts> {
  if (!hasSupabasePublicConfig()) return emptyPagination(filters);
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(postSelect)
    .eq("publication_status", "published")
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (filters?.featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) {
    console.error("Unable to load public posts:", error.message);
    return emptyPagination(filters);
  }

  const term = filters?.query?.trim().toLowerCase();
  let posts: BlogPost[] = ((data ?? []) as unknown[]).map(mapPostRow).filter((post: BlogPost) => {
    const categoryMatches = !filters?.category || post.category?.slug === filters.category;
    const tagMatches = !filters?.tag || post.tags.some((tag: PostTag) => tag.slug === filters.tag);
    const queryMatches = !term || [post.title, post.excerpt, post.categoryLabel, ...post.tags.map((tag: PostTag) => tag.name)]
      .some((value) => value.toLowerCase().includes(term));
    return categoryMatches && tagMatches && queryMatches;
  });

  if (typeof filters?.limit === "number") posts = posts.slice(0, filters.limit);
  const total = posts.length;
  const pageSize = filters?.pageSize ?? filters?.limit ?? 9;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(filters?.page ?? 1, 1), pageCount);
  if (!filters?.limit) posts = posts.slice((page - 1) * pageSize, page * pageSize);
  return { posts, total, page, pageSize, pageCount };
}

export async function getPublicPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!hasSupabasePublicConfig()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("slug", slug)
    .eq("publication_status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.error("Unable to load public post:", error.message);
    return null;
  }
  return data ? mapPostRow(data) : null;
}

export async function getAdminPosts(filters?: {
  query?: string;
  status?: AdminPostStatusFilter;
}): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(postSelect)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (filters?.status && !["all", "scheduled"].includes(filters.status)) query = query.eq("publication_status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load posts: ${error.message}`);
  const posts: BlogPost[] = ((data ?? []) as unknown[]).map(mapPostRow);
  const term = filters?.query?.trim().toLowerCase();
  const statusFiltered = filters?.status === "scheduled"
    ? posts.filter(isPostScheduled)
    : posts;
  if (!term) return statusFiltered;
  return statusFiltered.filter((post: BlogPost) => [post.title, post.slug, post.categoryLabel, ...post.tags.map((tag: PostTag) => tag.name)]
    .some((value) => value.toLowerCase().includes(term)));
}

export async function getAdminPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(`Unable to load post: ${error.message}`);
  return data ? mapPostRow(data) : null;
}

export async function getPostRevisions(postId: string): Promise<PostRevision[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_revisions")
    .select("id, post_id, version, snapshot, created_by, created_at")
    .eq("post_id", postId)
    .order("version", { ascending: false });
  if (error) throw new Error(`Unable to load revisions: ${error.message}`);
  return (data ?? []).map(mapRevisionRow);
}

export async function getAdminPostCounts(): Promise<Record<PostPublicationStatus | "scheduled" | "total", number>> {
  const posts = await getAdminPosts();
  const scheduled = posts.filter(isPostScheduled).length;
  return {
    total: posts.length,
    draft: posts.filter((post) => post.publicationStatus === "draft").length,
    published: posts.filter((post) => post.publicationStatus === "published" && !isPostScheduled(post)).length,
    scheduled,
    archived: posts.filter((post) => post.publicationStatus === "archived").length,
  };
}

export async function getPostTaxonomies(): Promise<{ categories: PostCategory[]; tags: PostTag[] }> {
  if (!hasSupabasePublicConfig()) return { categories: [], tags: [] };
  const supabase = await createClient();
  const [{ data: categoryRows, error: categoryError }, { data: tagRows, error: tagError }] = await Promise.all([
    supabase.from("post_categories").select("id, slug, name, description, accent, sort_order").order("sort_order"),
    supabase.from("post_tags").select("id, slug, name").order("name"),
  ]);
  if (categoryError) throw new Error(`Unable to load categories: ${categoryError.message}`);
  if (tagError) throw new Error(`Unable to load tags: ${tagError.message}`);
  return {
    categories: (categoryRows ?? []).map(mapCategoryRow),
    tags: (tagRows ?? []).map(mapTagRow),
  };
}
