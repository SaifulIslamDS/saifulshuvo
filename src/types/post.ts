export type PostPublicationStatus = "draft" | "published" | "archived";
export type AdminPostStatusFilter = PostPublicationStatus | "scheduled" | "all";

export type PostCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  accent: string;
  sortOrder: number;
};

export type PostTag = {
  id: string;
  slug: string;
  name: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  contentJson: Record<string, unknown>;
  category: PostCategory | null;
  categoryLabel: string;
  tags: PostTag[];
  publicationStatus: PostPublicationStatus;
  featured: boolean;
  readTimeMinutes: number;
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  sortOrder: number;
  version: number;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PostRevision = {
  id: number;
  postId: string;
  version: number;
  snapshot: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
};

export function isPostScheduled(post: Pick<BlogPost, "publicationStatus" | "publishedAt">): boolean {
  return post.publicationStatus === "published"
    && Boolean(post.publishedAt)
    && new Date(post.publishedAt as string).getTime() > Date.now();
}

export function postPublicationStatusLabel(status: PostPublicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
