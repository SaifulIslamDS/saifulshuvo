"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ProjectPublicationStatus, ProjectState } from "@/types/project";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publicationStatuses = new Set<ProjectPublicationStatus>(["draft", "published", "archived"]);
const projectStates = new Set<ProjectState>(["live", "in_development", "portfolio", "deployed"]);
const accents = new Set(["blue", "cyan", "violet", "green", "orange"]);

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

function list(formData: FormData, key: string): string[] {
  return text(formData, key)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, values) => values.indexOf(item) === index);
}

function positiveInteger(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function safeUrl(value: string | null, field: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Invalid protocol");
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid http or https URL.`);
  }
}

function projectPayload(formData: FormData) {
  const slug = text(formData, "slug").toLowerCase();
  const title = text(formData, "title");
  const category = text(formData, "category");
  const summary = text(formData, "summary");
  const description = text(formData, "description");
  const role = text(formData, "role");
  const publicationStatus = text(formData, "publication_status") as ProjectPublicationStatus;
  const projectState = text(formData, "project_state") as ProjectState;
  const accentCandidate = text(formData, "accent");

  if (title.length < 3) throw new Error("Project title must contain at least 3 characters.");
  if (!slugPattern.test(slug)) throw new Error("Slug must use lowercase letters, numbers and single hyphens only.");
  if (category.length < 2) throw new Error("Project category is required.");
  if (summary.length < 20 || summary.length > 360) throw new Error("Summary must contain 20–360 characters.");
  if (description.length < 40) throw new Error("Description must contain at least 40 characters.");
  if (role.length < 10) throw new Error("Your role must contain at least 10 characters.");
  if (!publicationStatuses.has(publicationStatus)) throw new Error("Invalid publication status.");
  if (!projectStates.has(projectState)) throw new Error("Invalid project state.");

  return {
    slug,
    title,
    category,
    summary,
    description,
    publication_status: publicationStatus,
    project_state: projectState,
    is_featured: formData.get("is_featured") === "on",
    stack: list(formData, "stack"),
    highlights: list(formData, "highlights"),
    accent: accents.has(accentCandidate) ? accentCandidate : "blue",
    role,
    source_url: safeUrl(optionalText(formData, "source_url"), "Source URL"),
    live_url: safeUrl(optionalText(formData, "live_url"), "Live URL"),
    sort_order: positiveInteger(formData, "sort_order", 0),
    seo_title: optionalText(formData, "seo_title"),
    seo_description: optionalText(formData, "seo_description"),
    problem_statement: text(formData, "problem_statement"),
    solution_overview: text(formData, "solution_overview"),
    outcomes: list(formData, "outcomes"),
    cover_image_url: safeUrl(optionalText(formData, "cover_image_url"), "Cover image URL"),
  };
}

function message(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected project operation error.";
}

function adminProjectPath(id?: string): string {
  return id ? `/admin/projects/${id}/edit` : "/admin/projects/new";
}

function fail(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(message(error))}`);
}

function refreshProjectPages(slugs: Array<string | null | undefined>) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/projects/${slug}`));
}

export async function createProjectAction(formData: FormData) {
  const admin = await requireAdmin();
  let payload: ReturnType<typeof projectPayload>;
  try {
    payload = projectPayload(formData);
  } catch (error) {
    fail(adminProjectPath(), error);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, created_by: admin.id, updated_by: admin.id })
    .select("id, slug")
    .single();

  if (error) fail(adminProjectPath(), error.code === "23505" ? new Error("This project slug already exists.") : error);

  refreshProjectPages([data.slug]);
  redirect(`/admin/projects/${data.id}/edit?success=created`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const path = adminProjectPath(id);
  let payload: ReturnType<typeof projectPayload>;
  try {
    payload = projectPayload(formData);
  } catch (error) {
    fail(path, error);
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .single();
  if (existingError) fail(path, existingError);

  const { error } = await supabase
    .from("projects")
    .update({ ...payload, updated_by: admin.id })
    .eq("id", id);

  if (error) fail(path, error.code === "23505" ? new Error("This project slug already exists.") : error);

  refreshProjectPages([existing.slug, payload.slug]);
  redirect(`${path}?success=updated`);
}

async function updateLifecycle(
  id: string,
  publicationStatus: ProjectPublicationStatus,
  success: string,
) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .single();
  if (existingError) fail("/admin/projects", existingError);

  const { error } = await supabase
    .from("projects")
    .update({ publication_status: publicationStatus, updated_by: admin.id })
    .eq("id", id);
  if (error) fail("/admin/projects", error);

  refreshProjectPages([existing.slug]);
  redirect(`/admin/projects?success=${success}`);
}

export async function publishProjectAction(id: string) {
  return updateLifecycle(id, "published", "published");
}

export async function moveToDraftAction(id: string) {
  return updateLifecycle(id, "draft", "drafted");
}

export async function archiveProjectAction(id: string) {
  return updateLifecycle(id, "archived", "archived");
}

export async function restoreProjectAction(id: string) {
  return updateLifecycle(id, "draft", "restored");
}

export async function toggleFeaturedProjectAction(id: string, nextValue: boolean) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .single();
  if (existingError) fail("/admin/projects", existingError);

  const { error } = await supabase
    .from("projects")
    .update({ is_featured: nextValue, updated_by: admin.id })
    .eq("id", id);
  if (error) fail("/admin/projects", error);

  refreshProjectPages([existing.slug]);
  redirect(`/admin/projects?success=${nextValue ? "featured" : "unfeatured"}`);
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("slug, publication_status")
    .eq("id", id)
    .single();
  if (existingError) fail("/admin/projects", existingError);
  if (existing.publication_status !== "archived") {
    fail("/admin/projects", new Error("Only archived projects can be permanently deleted."));
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) fail("/admin/projects", error);

  refreshProjectPages([existing.slug]);
  redirect("/admin/projects?success=deleted");
}
