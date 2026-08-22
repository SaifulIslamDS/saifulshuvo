export type WpMediaNode = {
  id?: string | null;
  databaseId?: number | null;
  mediaItemUrl?: string | null;
  sourceUrl?: string | null;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  mimeType?: string | null;
  date?: string | null;
  modified?: string | null;
  mediaDetails?: { width?: number | null; height?: number | null } | null;
};

export type WpMediaEdge = { node?: WpMediaNode | null } | null;
export type WpMediaConnection = { nodes?: WpMediaNode[] | null } | null;

export function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0): number {
  const valueNumber = typeof value === "number" ? value : Number(value);
  return Number.isFinite(valueNumber) ? valueNumber : fallback;
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function choice(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value.find((item): item is string => typeof item === "string");
    return first ?? fallback;
  }
  return fallback;
}

export function repeatText(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "text" in item) return text((item as { text?: unknown }).text);
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function mediaNode(edge: WpMediaEdge | WpMediaNode | null | undefined): WpMediaNode | null {
  if (!edge) return null;
  if (typeof edge === "object" && "node" in edge) return (edge as WpMediaEdge)?.node ?? null;
  return edge as WpMediaNode;
}

export const MEDIA_FIELDS = `
  id
  databaseId
  mediaItemUrl
  sourceUrl
  title
  altText
  caption
  mimeType
  date
  modified
  mediaDetails {
    width
    height
  }
`;
