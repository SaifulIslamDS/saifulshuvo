import type { BlogPost, PostCategory, PostRevision, PostTag } from "@/types/post";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function categoryFrom(value: unknown): PostCategory | null {
  const source = Array.isArray(value) ? record(value[0]) : record(value);
  if (!source) return null;
  return {
    id: text(source.id),
    slug: text(source.slug),
    name: text(source.name),
    description: text(source.description),
    accent: text(source.accent, "cyan"),
    sortOrder: numberValue(source.sort_order, 100),
  };
}

function tagsFrom(value: unknown): PostTag[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((link) => {
    const linkRecord = record(link);
    const tagValue = linkRecord?.tag;
    const tagRecord = Array.isArray(tagValue) ? record(tagValue[0]) : record(tagValue);
    if (!tagRecord) return [];
    return [{ id: text(tagRecord.id), slug: text(tagRecord.slug), name: text(tagRecord.name) }];
  }).filter((tag) => tag.id && tag.slug && tag.name);
}

export function mapPostRow(rowValue: unknown): BlogPost {
  const row = record(rowValue) ?? {};
  const category = categoryFrom(row.category);
  const json = record(row.content_json) ?? {};
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    excerpt: text(row.excerpt),
    contentHtml: text(row.content),
    contentJson: json,
    category,
    categoryLabel: category?.name || text(row.category_label || row.category_text || row.category, "Uncategorised"),
    tags: tagsFrom(row.post_tag_links),
    publicationStatus: text(row.publication_status, "draft") as BlogPost["publicationStatus"],
    featured: Boolean(row.is_featured),
    readTimeMinutes: numberValue(row.read_time_minutes, 1),
    featuredImageUrl: text(row.featured_image_url) || undefined,
    featuredImageAssetId: text(row.featured_image_asset_id) || undefined,
    seoTitle: text(row.seo_title) || undefined,
    seoDescription: text(row.seo_description) || undefined,
    canonicalUrl: text(row.canonical_url) || undefined,
    ogImageUrl: text(row.og_image_url) || undefined,
    ogImageAssetId: text(row.og_image_asset_id) || undefined,
    sortOrder: numberValue(row.sort_order, 100),
    version: numberValue(row.version, 1),
    publishedAt: text(row.published_at) || undefined,
    archivedAt: text(row.archived_at) || undefined,
    createdAt: text(row.created_at, new Date(0).toISOString()),
    updatedAt: text(row.updated_at, new Date(0).toISOString()),
  };
}

export function mapCategoryRow(value: unknown): PostCategory {
  const row = record(value) ?? {};
  return {
    id: text(row.id),
    slug: text(row.slug),
    name: text(row.name),
    description: text(row.description),
    accent: text(row.accent, "cyan"),
    sortOrder: numberValue(row.sort_order, 100),
  };
}

export function mapTagRow(value: unknown): PostTag {
  const row = record(value) ?? {};
  return { id: text(row.id), slug: text(row.slug), name: text(row.name) };
}

export function mapRevisionRow(value: unknown): PostRevision {
  const row = record(value) ?? {};
  return {
    id: numberValue(row.id),
    postId: text(row.post_id),
    version: numberValue(row.version, 1),
    snapshot: record(row.snapshot) ?? {},
    createdBy: text(row.created_by) || undefined,
    createdAt: text(row.created_at, new Date(0).toISOString()),
  };
}
