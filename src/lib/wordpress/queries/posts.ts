import { cache } from "react";
import { MEDIA_FIELDS, choice, mediaNode, numberValue, stripHtml, text, type WpMediaEdge } from "@/lib/wordpress/helpers";
import { mapWordPressMedia } from "@/lib/wordpress/media-mapper";
import { wpGraphql } from "@/lib/wordpress/client";
import type { BlogPost, PostCategory, PostTag } from "@/types/post";

export type PublicPostQueryOptions = {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
};

export type PaginatedPosts = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type CategoryNode = {
  id: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  categoryFields?: { accent?: string[] | string | null; sortOrder?: number | null } | null;
};

type TagNode = { id: string; slug?: string | null; name?: string | null };

type PostNode = {
  id: string;
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  date?: string | null;
  modified?: string | null;
  categories?: { nodes?: CategoryNode[] | null } | null;
  tags?: { nodes?: TagNode[] | null } | null;
  featuredImage?: WpMediaEdge;
  seoFields?: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    ogImage?: WpMediaEdge;
    featuredPost?: boolean | null;
    sortOrder?: number | null;
    readingTimeOverride?: number | null;
  } | null;
};

type PostsQuery = {
  posts?: { nodes?: PostNode[] | null } | null;
  categories?: { nodes?: CategoryNode[] | null } | null;
  tags?: { nodes?: TagNode[] | null } | null;
};

const POSTS_QUERY = `
  query SaifulShuvoPostsAndTaxonomies {
    posts(first: 100) {
      nodes {
        id
        databaseId
        slug
        title
        excerpt
        content
        date
        modified
        categories(first: 20) {
          nodes { id slug name description categoryFields { accent sortOrder } }
        }
        tags(first: 50) { nodes { id slug name } }
        featuredImage { node { ${MEDIA_FIELDS} } }
        seoFields {
          seoTitle
          seoDescription
          canonicalUrl
          ogImage { node { ${MEDIA_FIELDS} } }
          featuredPost
          sortOrder
          readingTimeOverride
        }
      }
    }
    categories(first: 100, where: { hideEmpty: false }) {
      nodes { id slug name description categoryFields { accent sortOrder } }
    }
    tags(first: 100, where: { hideEmpty: false }) {
      nodes { id slug name }
    }
  }
`;

function mapCategory(node: CategoryNode | null | undefined): PostCategory | null {
  if (!node) return null;
  return {
    id: node.id,
    slug: text(node.slug),
    name: text(node.name),
    description: text(node.description),
    accent: choice(node.categoryFields?.accent, "cyan"),
    sortOrder: numberValue(node.categoryFields?.sortOrder),
  };
}

function mapTag(node: TagNode): PostTag {
  return { id: node.id, slug: text(node.slug), name: text(node.name) };
}

function estimateReadingTime(contentHtml: string): number {
  const words = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function mapPost(node: PostNode): BlogPost {
  const category = mapCategory(node.categories?.nodes?.[0]);
  const featured = mapWordPressMedia(mediaNode(node.featuredImage), "blog");
  const og = mapWordPressMedia(mediaNode(node.seoFields?.ogImage), "blog");
  const contentHtml = text(node.content);
  const readTimeOverride = numberValue(node.seoFields?.readingTimeOverride, 0);

  return {
    id: node.id,
    slug: text(node.slug),
    title: stripHtml(text(node.title)),
    excerpt: stripHtml(text(node.excerpt)),
    contentHtml,
    contentJson: {},
    category,
    categoryLabel: category?.name || "Insights",
    tags: (node.tags?.nodes ?? []).map(mapTag).sort((a, b) => a.name.localeCompare(b.name)),
    publicationStatus: "published",
    featured: node.seoFields?.featuredPost ?? false,
    readTimeMinutes: readTimeOverride > 0 ? readTimeOverride : estimateReadingTime(contentHtml),
    featuredImageUrl: featured?.publicUrl,
    featuredImageAssetId: featured?.id,
    featuredImageAlt: featured?.altText,
    seoTitle: text(node.seoFields?.seoTitle) || undefined,
    seoDescription: text(node.seoFields?.seoDescription) || undefined,
    canonicalUrl: text(node.seoFields?.canonicalUrl) || undefined,
    ogImageUrl: og?.publicUrl,
    ogImageAssetId: og?.id,
    sortOrder: numberValue(node.seoFields?.sortOrder, 100),
    version: 1,
    publishedAt: node.date || undefined,
    createdAt: node.date || "",
    updatedAt: node.modified || node.date || "",
  };
}

const getPostsBundle = cache(async () => {
  const data = await wpGraphql<PostsQuery>(POSTS_QUERY);
  const posts = (data.posts?.nodes ?? [])
    .map(mapPost)
    .filter((post) => post.slug && post.title)
    .sort((a, b) => a.sortOrder - b.sortOrder || new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  const categories = (data.categories?.nodes ?? [])
    .map(mapCategory)
    .filter((item): item is PostCategory => Boolean(item?.slug && item.name) && item?.slug !== "uncategorized")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const tags = (data.tags?.nodes ?? [])
    .map(mapTag)
    .filter((tag) => tag.slug && tag.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  return { posts, categories, tags };
});

function matchesSearch(post: BlogPost, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    post.title,
    post.excerpt,
    post.categoryLabel,
    ...post.tags.map((tag) => tag.name),
    stripHtml(post.contentHtml),
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

export async function getPublicPosts(options: PublicPostQueryOptions = {}): Promise<PaginatedPosts> {
  const bundle = await getPostsBundle();
  let posts = [...bundle.posts];
  if (options.category) posts = posts.filter((post) => post.category?.slug === options.category);
  if (options.tag) posts = posts.filter((post) => post.tags.some((tag) => tag.slug === options.tag));
  if (options.query) posts = posts.filter((post) => matchesSearch(post, options.query || ""));

  const pageSize = Math.max(1, options.limit || options.pageSize || 9);
  const page = Math.max(1, options.page || 1);
  const total = posts.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pagePosts = options.limit ? posts.slice(0, options.limit) : posts.slice(start, start + pageSize);

  return { posts: pagePosts, total, page, pageSize, pageCount };
}

export async function getAllPublicPosts(): Promise<BlogPost[]> {
  return [...(await getPostsBundle()).posts];
}

export async function getPublicPostBySlug(slug: string): Promise<BlogPost | null> {
  const bundle = await getPostsBundle();
  return bundle.posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostTaxonomies(): Promise<{ categories: PostCategory[]; tags: PostTag[] }> {
  const bundle = await getPostsBundle();
  return { categories: [...bundle.categories], tags: [...bundle.tags] };
}

export async function getPublicPostSlugs(): Promise<string[]> {
  return (await getPostsBundle()).posts.map((post) => post.slug).filter(Boolean);
}
