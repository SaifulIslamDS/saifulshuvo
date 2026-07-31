"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { MediaPurpose } from "@/types/media";

const BUCKET = "portfolio-media";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};
const purposes = new Set<MediaPurpose>(["general", "profile", "project", "blog", "cv"]);

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected media operation error.";
}

function fail(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(message(error))}`);
}

function refreshMediaPaths() {
  revalidatePath("/");
  revalidatePath("/cv");
  revalidatePath("/projects");
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/media");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/posts");
}

function safeBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "media";
}

export async function uploadMediaAction(formData: FormData) {
  const admin = await requireAdmin();
  const fileValue = formData.get("file");
  const path = "/admin/media";
  if (!(fileValue instanceof File) || fileValue.size === 0) fail(path, new Error("Choose an image or PDF to upload."));

  const extension = mimeExtensions[fileValue.type];
  if (!extension) fail(path, new Error("Allowed files: JPG, PNG, WebP, GIF and PDF."));
  const mediaKind = fileValue.type === "application/pdf" ? "document" : "image";
  const sizeLimit = mediaKind === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (fileValue.size > sizeLimit) fail(path, new Error(`${mediaKind === "image" ? "Images" : "PDF files"} must be ${sizeLimit / 1024 / 1024} MB or smaller.`));

  const purposeCandidate = text(formData, "purpose") as MediaPurpose;
  const purpose = purposes.has(purposeCandidate) ? purposeCandidate : "general";
  if (purpose === "cv" && mediaKind !== "document") fail(path, new Error("CV uploads must be PDF documents."));
  if (["profile", "project", "blog"].includes(purpose) && mediaKind !== "image") fail(path, new Error(`${purpose} media must be an image.`));

  const buffer = Buffer.from(await fileValue.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const supabase = await createClient();
  const { data: duplicate } = await supabase
    .from("media_assets")
    .select("id, original_name")
    .eq("sha256", sha256)
    .eq("size_bytes", fileValue.size)
    .neq("status", "archived")
    .maybeSingle();
  if (duplicate) fail(path, new Error(`This file is already in the media library as “${duplicate.original_name}”.`));

  const now = new Date();
  const objectPath = `${purpose}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeBaseName(fileValue.name)}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: fileValue.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) fail(path, uploadError);

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  const { data: asset, error: assetError } = await supabase.from("media_assets").insert({
    bucket_id: BUCKET,
    object_path: objectPath,
    public_url: publicUrl,
    original_name: fileValue.name,
    mime_type: fileValue.type,
    media_kind: mediaKind,
    purpose,
    size_bytes: fileValue.size,
    alt_text: text(formData, "alt_text") || null,
    caption: text(formData, "caption") || null,
    sha256,
    uploaded_by: admin.id,
  }).select("id").single();

  if (assetError) {
    await supabase.storage.from(BUCKET).remove([objectPath]);
    fail(path, assetError);
  }

  if (purpose === "cv") {
    const versionLabel = text(formData, "cv_version_label") || now.toISOString().slice(0, 10);
    const { error: cvError } = await supabase.from("cv_documents").insert({
      media_asset_id: asset.id,
      title: text(formData, "cv_title") || "Curriculum Vitae",
      version_label: versionLabel,
      notes: text(formData, "cv_notes") || null,
      created_by: admin.id,
    });
    if (cvError) {
      await supabase.from("media_assets").update({ status: "archived" }).eq("id", asset.id);
      fail(path, cvError);
    }
  }

  refreshMediaPaths();
  redirect(`${path}?success=${purpose === "cv" ? "cv-uploaded" : "uploaded"}`);
}

export async function updateMediaMetadataAction(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("media_assets").update({
    alt_text: text(formData, "alt_text") || null,
    caption: text(formData, "caption") || null,
    purpose: purposes.has(text(formData, "purpose") as MediaPurpose) ? text(formData, "purpose") : "general",
  }).eq("id", id);
  if (error) fail("/admin/media", error);
  refreshMediaPaths();
  redirect("/admin/media?success=updated");
}

async function usageCount(id: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("media_asset_usage_count", { target_asset_id: id });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function archiveMediaAction(id: string) {
  await requireAdmin();
  const path = "/admin/media";
  const count = await usageCount(id).catch((error) => fail(path, error));
  if (count > 0) fail(path, new Error(`This media item has ${count} active assignment${count === 1 ? "" : "s"}. Remove them before archiving.`));
  const supabase = await createClient();
  const { error } = await supabase.from("media_assets").update({ status: "archived" }).eq("id", id);
  if (error) fail(path, error);
  refreshMediaPaths();
  redirect(`${path}?success=archived`);
}

export async function restoreMediaAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("media_assets").update({ status: "active" }).eq("id", id);
  if (error) fail("/admin/media", error);
  refreshMediaPaths();
  redirect("/admin/media?success=restored");
}

export async function deleteMediaAction(id: string) {
  await requireAdmin();
  const path = "/admin/media";
  const supabase = await createClient();
  const { data: asset, error: readError } = await supabase.from("media_assets").select("object_path, status").eq("id", id).single();
  if (readError) fail(path, readError);
  if (asset.status !== "archived") fail(path, new Error("Archive the media item before permanent deletion."));
  const count = await usageCount(id).catch((error) => fail(path, error));
  if (count > 0) fail(path, new Error("Assigned media cannot be permanently deleted."));
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([asset.object_path]);
  if (storageError) fail(path, storageError);
  const { error: deleteError } = await supabase.from("media_assets").delete().eq("id", id);
  if (deleteError) fail(path, deleteError);
  refreshMediaPaths();
  redirect("/admin/media?success=deleted");
}

export async function setProfileImageAction(formData: FormData) {
  const admin = await requireAdmin();
  const assetId = text(formData, "profile_image_asset_id") || null;
  const supabase = await createClient();
  if (assetId) {
    const { data, error } = await supabase.from("media_assets").select("id").eq("id", assetId).eq("media_kind", "image").eq("status", "active").maybeSingle();
    if (error || !data) fail("/admin/settings", new Error("Choose an active image from the media library."));
  }
  const { error } = await supabase.from("site_settings").update({ profile_image_asset_id: assetId, updated_by: admin.id }).eq("id", "primary");
  if (error) fail("/admin/settings", error);
  await supabase.from("audit_events").insert({ actor_id: admin.id, event_type: "profile.image_updated", entity_type: "site_settings", entity_id: "primary", metadata: { media_asset_id: assetId } });
  refreshMediaPaths();
  redirect("/admin/settings?success=profile-image");
}

export async function setActiveCvAction(formData: FormData) {
  const admin = await requireAdmin();
  const cvId = text(formData, "active_cv_document_id") || null;
  const supabase = await createClient();
  if (cvId) {
    const { data, error } = await supabase.from("cv_documents").select("id").eq("id", cvId).maybeSingle();
    if (error || !data) fail("/admin/settings", new Error("Choose a valid CV version."));
  }
  const { error } = await supabase.from("site_settings").update({ active_cv_document_id: cvId, updated_by: admin.id }).eq("id", "primary");
  if (error) fail("/admin/settings", error);
  await supabase.from("audit_events").insert({ actor_id: admin.id, event_type: "cv.activated", entity_type: "cv_document", entity_id: cvId, metadata: { active: Boolean(cvId) } });
  refreshMediaPaths();
  redirect("/admin/settings?success=active-cv");
}

export async function updateCvMetadataAction(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("cv_documents").update({
    title: text(formData, "title") || "Curriculum Vitae",
    version_label: text(formData, "version_label") || new Date().toISOString().slice(0, 10),
    notes: text(formData, "notes") || null,
  }).eq("id", id);
  if (error) fail("/admin/settings", error);
  refreshMediaPaths();
  redirect("/admin/settings?success=cv-updated");
}

export async function deleteCvDocumentAction(id: string) {
  await requireAdmin();
  const path = "/admin/settings";
  const supabase = await createClient();
  const { data: cv, error: cvError } = await supabase.from("cv_documents").select("media_asset_id").eq("id", id).single();
  if (cvError) fail(path, cvError);
  const { data: settings, error: settingsError } = await supabase.from("site_settings").select("active_cv_document_id").eq("id", "primary").single();
  if (settingsError) fail(path, settingsError);
  if (settings.active_cv_document_id === id) fail(path, new Error("Activate another CV or clear the active CV before deleting this version."));
  const { error: deleteError } = await supabase.from("cv_documents").delete().eq("id", id);
  if (deleteError) fail(path, deleteError);
  const { error: archiveError } = await supabase.from("media_assets").update({ status: "archived" }).eq("id", cv.media_asset_id);
  if (archiveError) fail(path, archiveError);
  refreshMediaPaths();
  redirect("/admin/settings?success=cv-deleted");
}
