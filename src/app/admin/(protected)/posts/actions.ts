"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { calculateReadTime, excerptFromHtml, sanitiseRichHtml } from "@/lib/posts/content";
import { createClient } from "@/lib/supabase/server";
import type { PostPublicationStatus } from "@/types/post";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statuses = new Set<PostPublicationStatus>(["draft", "published", "archived"]);
const accents = new Set(["blue", "cyan", "violet", "green", "orange"]);

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

function positiveInteger(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function optionalDate(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Publish time is invalid.");
  return date.toISOString();
}

function safeUrl(value: string | null, field: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid protocol");
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid http or https URL.`);
  }
}

function jsonObject(value: string): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected blog operation error.";
}

function postPath(id?: string): string {
  return id ? `/admin/posts/${id}/edit` : "/admin/posts/new";
}

function fail(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(message(error))}`);
}

function refreshBlogPaths(slugs: Array<string | null | undefined>, categories: string[] = [], tags: string[] = []) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/blog/${slug}`));
  categories.filter(Boolean).forEach((slug) => revalidatePath(`/blog/category/${slug}`));
  tags.filter(Boolean).forEach((slug) => revalidatePath(`/blog/tag/${slug}`));
}

async function resolveCategory(categoryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .single();
  if (error) throw new Error("Select a valid blog category.");
  return data;
}

async function postPayload(formData: FormData) {
  const slug = text(formData, "slug").toLowerCase();
  const title = text(formData, "title");
  const rawHtml = text(formData, "content_html");
  const content = sanitiseRichHtml(rawHtml);
  const requestedExcerpt = text(formData, "excerpt");
  const excerpt = requestedExcerpt || excerptFromHtml(content);
  const categoryId = text(formData, "category_id");
  const category = await resolveCategory(categoryId);
  const publicationStatus = text(formData, "publication_status") as PostPublicationStatus;

  if (title.length < 5 || title.length > 180) throw new Error("Post title must contain 5–180 characters.");
  if (!slugPattern.test(slug)) throw new Error("Slug must use lowercase letters, numbers and single hyphens only.");
  if (excerpt.length < 30 || excerpt.length > 360) throw new Error("Excerpt must contain 30–360 characters.");
  if (content.length < 80) throw new Error("Article content must contain at least 80 characters.");
  if (!statuses.has(publicationStatus)) throw new Error("Invalid publication status.");

  const tagIds = formData.getAll("tag_ids")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    values: {
      slug,
      title,
      excerpt,
      content,
      content_json: jsonObject(text(formData, "content_json")),
      category_id: category.id,
      category: category.name,
      publication_status: publicationStatus,
      published_at: publicationStatus === "published" ? optionalDate(formData, "published_at") : null,
      is_featured: formData.get("is_featured") === "on",
      sort_order: positiveInteger(formData, "sort_order", 100),
      read_time_minutes: calculateReadTime(content),
      featured_image_url: safeUrl(optionalText(formData, "featured_image_url"), "Featured image URL"),
      seo_title: optionalText(formData, "seo_title"),
      seo_description: optionalText(formData, "seo_description"),
      canonical_url: safeUrl(optionalText(formData, "canonical_url"), "Canonical URL"),
      og_image_url: safeUrl(optionalText(formData, "og_image_url"), "Open Graph image URL"),
    },
    tagIds: [...new Set(tagIds)],
    categorySlug: category.slug,
  };
}

async function replacePostTags(postId: string, tagIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("post_tag_links").delete().eq("post_id", postId);
  if (deleteError) throw deleteError;
  if (!tagIds.length) return;
  const { error } = await supabase.from("post_tag_links").insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
  if (error) throw error;
}

async function preserveEnhancedRevision(postId: string, actorId: string) {
  const supabase = await createClient();
  const [{ data: post, error: postError }, { data: links, error: linkError }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", postId).single(),
    supabase.from("post_tag_links").select("tag_id").eq("post_id", postId),
  ]);
  if (postError) throw postError;
  if (linkError) throw linkError;
  const snapshot = { ...post, tag_ids: (links ?? []).map((link: { tag_id: string }) => link.tag_id) };
  const { error } = await supabase.from("post_revisions").insert({
    post_id: postId,
    version: post.version,
    snapshot,
    created_by: actorId,
  });
  if (error && error.code !== "23505") throw error;
}

export async function createPostAction(formData: FormData) {
  const admin = await requireAdmin();
  let payload: Awaited<ReturnType<typeof postPayload>>;
  try { payload = await postPayload(formData); } catch (error) { fail(postPath(), error); }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ ...payload.values, created_by: admin.id, updated_by: admin.id })
    .select("id, slug")
    .single();
  if (error) fail(postPath(), error.code === "23505" ? new Error("This post slug already exists.") : error);

  try { await replacePostTags(data.id, payload.tagIds); } catch (error) { fail(postPath(data.id), error); }
  refreshBlogPaths([data.slug], [payload.categorySlug]);
  redirect(`/admin/posts/${data.id}/edit?success=created`);
}

export async function updatePostAction(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const path = postPath(id);
  let payload: Awaited<ReturnType<typeof postPayload>>;
  try { payload = await postPayload(formData); } catch (error) { fail(path, error); }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("posts")
    .select("slug, category:post_categories(slug), post_tag_links(tag:post_tags(slug))")
    .eq("id", id)
    .single();
  if (existingError) fail(path, existingError);

  try { await preserveEnhancedRevision(id, admin.id); } catch (error) { fail(path, error); }
  const { error } = await supabase.from("posts").update({ ...payload.values, updated_by: admin.id }).eq("id", id);
  if (error) fail(path, error.code === "23505" ? new Error("This post slug already exists.") : error);
  try { await replacePostTags(id, payload.tagIds); } catch (error) { fail(path, error); }

  type SlugRelation =
    | { slug?: string | null }
    | Array<{ slug?: string | null }>
    | null
    | undefined;

  const readRelationSlug = (value: SlugRelation): string | undefined => {
    const relation = Array.isArray(value) ? value[0] : value;
    return relation?.slug ?? undefined;
  };

  const oldCategory = readRelationSlug(existing.category as SlugRelation);
  const oldTags = (existing.post_tag_links ?? []).flatMap((link: unknown) => {
    const tag = (link as { tag?: SlugRelation }).tag;
    const slug = readRelationSlug(tag);
    return slug ? [slug] : [];
  });
  refreshBlogPaths([existing.slug, payload.values.slug], [oldCategory, payload.categorySlug].filter(Boolean), oldTags);
  redirect(`${path}?success=updated`);
}

async function updateLifecycle(id: string, status: PostPublicationStatus, success: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase.from("posts").select("slug").eq("id", id).single();
  if (existingError) fail("/admin/posts", existingError);
  try { await preserveEnhancedRevision(id, admin.id); } catch (error) { fail("/admin/posts", error); }
  const { error } = await supabase.from("posts").update({ publication_status: status, updated_by: admin.id }).eq("id", id);
  if (error) fail("/admin/posts", error);
  refreshBlogPaths([existing.slug]);
  redirect(`/admin/posts?success=${success}`);
}

export async function publishPostAction(id: string) { return updateLifecycle(id, "published", "published"); }
export async function movePostToDraftAction(id: string) { return updateLifecycle(id, "draft", "drafted"); }
export async function archivePostAction(id: string) { return updateLifecycle(id, "archived", "archived"); }
export async function restorePostAction(id: string) { return updateLifecycle(id, "draft", "restored"); }

export async function toggleFeaturedPostAction(id: string, nextValue: boolean) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase.from("posts").select("slug").eq("id", id).single();
  if (existingError) fail("/admin/posts", existingError);
  try { await preserveEnhancedRevision(id, admin.id); } catch (error) { fail("/admin/posts", error); }
  const { error } = await supabase.from("posts").update({ is_featured: nextValue, updated_by: admin.id }).eq("id", id);
  if (error) fail("/admin/posts", error);
  refreshBlogPaths([existing.slug]);
  redirect(`/admin/posts?success=${nextValue ? "featured" : "unfeatured"}`);
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase.from("posts").select("slug, publication_status").eq("id", id).single();
  if (existingError) fail("/admin/posts", existingError);
  if (existing.publication_status !== "archived") fail("/admin/posts", new Error("Only archived posts can be permanently deleted."));
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) fail("/admin/posts", error);
  refreshBlogPaths([existing.slug]);
  redirect("/admin/posts?success=deleted");
}

export async function restorePostRevisionAction(postId: string, revisionId: number) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: revision, error: revisionError } = await supabase
    .from("post_revisions")
    .select("version, snapshot")
    .eq("id", revisionId)
    .eq("post_id", postId)
    .single();
  if (revisionError) fail(`/admin/posts/${postId}/revisions`, revisionError);
  const snapshot = revision.snapshot as Record<string, unknown>;
  const { data: existing, error: existingError } = await supabase.from("posts").select("slug").eq("id", postId).single();
  if (existingError) fail(`/admin/posts/${postId}/revisions`, existingError);
  try { await preserveEnhancedRevision(postId, admin.id); } catch (error) { fail(`/admin/posts/${postId}/revisions`, error); }

  const restorable = {
    slug: snapshot.slug,
    title: snapshot.title,
    excerpt: snapshot.excerpt,
    content: snapshot.content,
    content_json: snapshot.content_json,
    category_id: snapshot.category_id,
    category: snapshot.category,
    publication_status: "draft",
    read_time_minutes: snapshot.read_time_minutes,
    featured_image_url: snapshot.featured_image_url,
    seo_title: snapshot.seo_title,
    seo_description: snapshot.seo_description,
    canonical_url: snapshot.canonical_url,
    og_image_url: snapshot.og_image_url,
    is_featured: snapshot.is_featured,
    sort_order: snapshot.sort_order,
    updated_by: admin.id,
  };
  const { error } = await supabase.from("posts").update(restorable).eq("id", postId);
  if (error) fail(`/admin/posts/${postId}/revisions`, error);
  const tagIds = Array.isArray(snapshot.tag_ids) ? snapshot.tag_ids.filter((value): value is string => typeof value === "string") : [];
  try { await replacePostTags(postId, tagIds); } catch (error) { fail(`/admin/posts/${postId}/revisions`, error); }
  await supabase.from("audit_events").insert({
    actor_id: admin.id,
    event_type: "post.revision_restored",
    entity_type: "post",
    entity_id: postId,
    metadata: { revision_id: revisionId, restored_version: revision.version },
  });
  refreshBlogPaths([existing.slug, typeof snapshot.slug === "string" ? snapshot.slug : null]);
  redirect(`/admin/posts/${postId}/edit?success=revision-restored`);
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const slug = text(formData, "slug").toLowerCase();
  const accent = text(formData, "accent");
  if (name.length < 2 || !slugPattern.test(slug)) fail("/admin/posts/taxonomies", new Error("Provide a valid category name and slug."));
  const supabase = await createClient();
  const { error } = await supabase.from("post_categories").insert({
    name, slug, description: text(formData, "description"),
    accent: accents.has(accent) ? accent : "cyan",
    sort_order: positiveInteger(formData, "sort_order", 100),
  });
  if (error) fail("/admin/posts/taxonomies", error.code === "23505" ? new Error("Category name or slug already exists.") : error);
  refreshBlogPaths([], [slug]);
  redirect("/admin/posts/taxonomies?success=category-created");
}

export async function createTagAction(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const slug = text(formData, "slug").toLowerCase();
  if (name.length < 2 || !slugPattern.test(slug)) fail("/admin/posts/taxonomies", new Error("Provide a valid tag name and slug."));
  const supabase = await createClient();
  const { error } = await supabase.from("post_tags").insert({ name, slug });
  if (error) fail("/admin/posts/taxonomies", error.code === "23505" ? new Error("Tag name or slug already exists.") : error);
  refreshBlogPaths([], [], [slug]);
  redirect("/admin/posts/taxonomies?success=tag-created");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const slug = text(formData, "slug").toLowerCase();
  const accent = text(formData, "accent");
  if (name.length < 2 || !slugPattern.test(slug)) fail("/admin/posts/taxonomies", new Error("Provide a valid category name and slug."));
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase.from("post_categories").select("slug").eq("id", id).single();
  if (readError) fail("/admin/posts/taxonomies", readError);
  const { error } = await supabase.from("post_categories").update({ name, slug, description: text(formData, "description"), accent: accents.has(accent) ? accent : "cyan", sort_order: positiveInteger(formData, "sort_order", 100) }).eq("id", id);
  if (error) fail("/admin/posts/taxonomies", error.code === "23505" ? new Error("Category name or slug already exists.") : error);
  await supabase.from("posts").update({ category: name }).eq("category_id", id);
  refreshBlogPaths([], [existing.slug, slug]);
  redirect("/admin/posts/taxonomies?success=category-updated");
}

export async function updateTagAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const slug = text(formData, "slug").toLowerCase();
  if (name.length < 2 || !slugPattern.test(slug)) fail("/admin/posts/taxonomies", new Error("Provide a valid tag name and slug."));
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase.from("post_tags").select("slug").eq("id", id).single();
  if (readError) fail("/admin/posts/taxonomies", readError);
  const { error } = await supabase.from("post_tags").update({ name, slug }).eq("id", id);
  if (error) fail("/admin/posts/taxonomies", error.code === "23505" ? new Error("Tag name or slug already exists.") : error);
  refreshBlogPaths([], [], [existing.slug, slug]);
  redirect("/admin/posts/taxonomies?success=tag-updated");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error: readError } = await supabase.from("post_categories").select("slug").eq("id", id).single();
  if (readError) fail("/admin/posts/taxonomies", readError);
  const { count, error: countError } = await supabase.from("posts").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (countError) fail("/admin/posts/taxonomies", countError);
  if ((count ?? 0) > 0) fail("/admin/posts/taxonomies", new Error("Move posts to another category before deleting this category."));
  const { error } = await supabase.from("post_categories").delete().eq("id", id);
  if (error) fail("/admin/posts/taxonomies", error);
  refreshBlogPaths([], [data.slug]);
  redirect("/admin/posts/taxonomies?success=category-deleted");
}

export async function deleteTagAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error: readError } = await supabase.from("post_tags").select("slug").eq("id", id).single();
  if (readError) fail("/admin/posts/taxonomies", readError);
  const { error } = await supabase.from("post_tags").delete().eq("id", id);
  if (error) fail("/admin/posts/taxonomies", error);
  refreshBlogPaths([], [], [data.slug]);
  redirect("/admin/posts/taxonomies?success=tag-deleted");
}
