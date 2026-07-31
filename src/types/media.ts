export type MediaKind = "image" | "document";
export type MediaPurpose = "general" | "profile" | "project" | "blog" | "cv";
export type MediaStatus = "active" | "archived";

export type MediaAsset = {
  id: string;
  bucketId: string;
  objectPath: string;
  publicUrl: string;
  originalName: string;
  mimeType: string;
  mediaKind: MediaKind;
  purpose: MediaPurpose;
  status: MediaStatus;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  sha256?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type CvDocument = {
  id: string;
  mediaAssetId: string;
  title: string;
  versionLabel: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  media: MediaAsset;
};

export type PublicSiteMedia = {
  profileImage: MediaAsset | null;
  activeCv: CvDocument | null;
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}
