import type { CvDocument, MediaAsset } from "@/types/media";

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

export function mapMediaAsset(value: unknown, usageCount = 0): MediaAsset {
  const row = record(value) ?? {};
  return {
    id: text(row.id),
    bucketId: text(row.bucket_id, "portfolio-media"),
    objectPath: text(row.object_path),
    publicUrl: text(row.public_url),
    originalName: text(row.original_name),
    mimeType: text(row.mime_type),
    mediaKind: text(row.media_kind, "image") as MediaAsset["mediaKind"],
    purpose: text(row.purpose, "general") as MediaAsset["purpose"],
    status: text(row.status, "active") as MediaAsset["status"],
    sizeBytes: numberValue(row.size_bytes),
    width: numberValue(row.width) || undefined,
    height: numberValue(row.height) || undefined,
    altText: text(row.alt_text) || undefined,
    caption: text(row.caption) || undefined,
    sha256: text(row.sha256) || undefined,
    usageCount,
    createdAt: text(row.created_at, new Date(0).toISOString()),
    updatedAt: text(row.updated_at, new Date(0).toISOString()),
    archivedAt: text(row.archived_at) || undefined,
  };
}

export function mapCvDocument(value: unknown, activeId?: string | null): CvDocument | null {
  const row = record(value);
  if (!row) return null;
  const mediaValue = Array.isArray(row.media) ? row.media[0] : row.media;
  const media = mapMediaAsset(mediaValue);
  if (!media.id) return null;
  return {
    id: text(row.id),
    mediaAssetId: text(row.media_asset_id),
    title: text(row.title, "Curriculum Vitae"),
    versionLabel: text(row.version_label),
    notes: text(row.notes) || undefined,
    createdAt: text(row.created_at, new Date(0).toISOString()),
    updatedAt: text(row.updated_at, new Date(0).toISOString()),
    isActive: text(row.id) === activeId,
    media,
  };
}
