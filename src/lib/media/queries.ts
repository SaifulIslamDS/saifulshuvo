import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { mapCvDocument, mapMediaAsset } from "@/lib/media/media-mapper";
import type { CvDocument, MediaAsset, MediaKind, MediaPurpose, MediaStatus, PublicSiteMedia } from "@/types/media";

const mediaSelect = `
  id, bucket_id, object_path, public_url, original_name, mime_type,
  media_kind, purpose, status, size_bytes, width, height, alt_text,
  caption, sha256, created_at, updated_at, archived_at
`;

export type MediaFilters = {
  query?: string;
  kind?: MediaKind | "all";
  purpose?: MediaPurpose | "all";
  status?: MediaStatus | "all";
};

async function usageCount(supabase: Awaited<ReturnType<typeof createClient>>, id: string): Promise<number> {
  const { data, error } = await supabase.rpc("media_asset_usage_count", { target_asset_id: id });
  if (error) return 0;
  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function getAdminMediaAssets(filters?: MediaFilters): Promise<MediaAsset[]> {
  const supabase = await createClient();
  let query = supabase.from("media_assets").select(mediaSelect).order("created_at", { ascending: false });
  if (filters?.kind && filters.kind !== "all") query = query.eq("media_kind", filters.kind);
  if (filters?.purpose && filters.purpose !== "all") query = query.eq("purpose", filters.purpose);
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load media assets: ${error.message}`);
  const term = filters?.query?.trim().toLowerCase();
  const rows = term
    ? (data ?? []).filter((row: Record<string, unknown>) => [row.original_name, row.alt_text, row.caption]
        .some((value) => typeof value === "string" && value.toLowerCase().includes(term)))
    : (data ?? []);
  return Promise.all(rows.map(async (row: unknown) => {
    const base = mapMediaAsset(row);
    return mapMediaAsset(row, await usageCount(supabase, base.id));
  }));
}

export async function getAdminImageAssets(): Promise<MediaAsset[]> {
  const assets = await getAdminMediaAssets({ kind: "image", status: "active" });
  return assets.sort((a, b) => a.originalName.localeCompare(b.originalName));
}

export async function getAdminCvDocuments(): Promise<CvDocument[]> {
  const supabase = await createClient();
  const [{ data: settings, error: settingsError }, { data, error }] = await Promise.all([
    supabase.from("site_settings").select("active_cv_document_id").eq("id", "primary").maybeSingle(),
    supabase.from("cv_documents").select(`id, media_asset_id, title, version_label, notes, created_at, updated_at, media:media_assets(${mediaSelect})`).order("created_at", { ascending: false }),
  ]);
  if (settingsError) throw new Error(`Unable to load active CV: ${settingsError.message}`);
  if (error) throw new Error(`Unable to load CV documents: ${error.message}`);
  const activeId = settings?.active_cv_document_id as string | null | undefined;
  return (data ?? []).flatMap((row: unknown) => {
    const mapped = mapCvDocument(row, activeId);
    return mapped ? [mapped] : [];
  });
}

export async function getPublicSiteMedia(): Promise<PublicSiteMedia> {
  if (!hasSupabasePublicConfig()) return { profileImage: null, activeCv: null };
  const supabase = await createClient();
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("profile_image_asset_id, active_cv_document_id")
    .eq("id", "primary")
    .maybeSingle();
  if (error || !settings) return { profileImage: null, activeCv: null };

  const profileId = settings.profile_image_asset_id as string | null;
  const cvId = settings.active_cv_document_id as string | null;
  const [profileResult, cvResult] = await Promise.all([
    profileId
      ? supabase.from("media_assets").select(mediaSelect).eq("id", profileId).eq("status", "active").maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    cvId
      ? supabase.from("cv_documents").select(`id, media_asset_id, title, version_label, notes, created_at, updated_at, media:media_assets(${mediaSelect})`).eq("id", cvId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    profileImage: profileResult.data ? mapMediaAsset(profileResult.data) : null,
    activeCv: cvResult.data ? mapCvDocument(cvResult.data, cvId) : null,
  };
}


export async function getMediaAssetById(id: string | null | undefined): Promise<MediaAsset | null> {
  if (!id || !hasSupabasePublicConfig()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("media_assets").select(mediaSelect).eq("id", id).eq("status", "active").maybeSingle();
  if (error || !data) return null;
  return mapMediaAsset(data);
}

export async function getProjectGallery(projectId: string): Promise<MediaAsset[]> {
  if (!hasSupabasePublicConfig()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_media")
    .select(`sort_order, media:media_assets(${mediaSelect})`)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Unable to load project gallery:", error.message);
    return [];
  }
  return (data ?? []).flatMap((row: Record<string, unknown>) => {
    const mediaValue = Array.isArray(row.media) ? row.media[0] : row.media;
    const media = mapMediaAsset(mediaValue);
    return media.id ? [media] : [];
  });
}

export { mediaSelect };
