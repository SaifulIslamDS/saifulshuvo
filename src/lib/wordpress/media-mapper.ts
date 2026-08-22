import type { MediaAsset } from "@/types/media";
import type { WpMediaNode } from "@/lib/wordpress/helpers";

export function mapWordPressMedia(node: WpMediaNode | null | undefined, purpose: MediaAsset["purpose"] = "general"): MediaAsset | null {
  if (!node) return null;
  const publicUrl = node.mediaItemUrl || node.sourceUrl || "";
  if (!publicUrl) return null;
  const mimeType = node.mimeType || "application/octet-stream";
  let objectPath = publicUrl;
  try { objectPath = new URL(publicUrl).pathname; } catch { /* keep original */ }

  return {
    id: node.id || String(node.databaseId || publicUrl),
    bucketId: "wordpress-media-library",
    objectPath,
    publicUrl,
    originalName: node.title || objectPath.split("/").pop() || "media",
    mimeType,
    mediaKind: mimeType.startsWith("image/") ? "image" : "document",
    purpose,
    status: "active",
    sizeBytes: 0,
    width: node.mediaDetails?.width ?? undefined,
    height: node.mediaDetails?.height ?? undefined,
    altText: node.altText || undefined,
    caption: node.caption ? node.caption.replace(/<[^>]*>/g, "").trim() : undefined,
    usageCount: 0,
    createdAt: node.date || "",
    updatedAt: node.modified || node.date || "",
  };
}
