"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { HomepageSectionKey, ProcessItem } from "@/types/profile";

const icons = new Set(["chart", "brain", "briefcase", "code", "layers", "search", "spark", "user", "database"]);
const accents = new Set(["blue", "cyan", "violet", "green", "orange"]);
const sectionKeys: HomepageSectionKey[] = ["about", "experience", "services", "skills", "projects", "insights", "process", "cta"];

function value(formData: FormData, key: string): string { const raw = formData.get(key); return typeof raw === "string" ? raw.trim() : ""; }
function optional(formData: FormData, key: string): string | null { return value(formData, key) || null; }
function lines(formData: FormData, key: string): string[] { return value(formData, key).split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }
function integer(formData: FormData, key: string, fallback = 0): number { const parsed = Number.parseInt(value(formData, key), 10); return Number.isFinite(parsed) ? parsed : fallback; }
function decimal(formData: FormData, key: string): number | null { const raw = value(formData, key); if (!raw) return null; const parsed = Number.parseFloat(raw); return Number.isFinite(parsed) && parsed >= 0 ? parsed : null; }
function checked(formData: FormData, key: string): boolean { return formData.get(key) === "on"; }
function safeHref(input: string, label: string): string {
  if (input.startsWith("/")) return input;
  try { const url = new URL(input); if (!["http:", "https:", "mailto:"].includes(url.protocol)) throw new Error(); return url.toString(); }
  catch { throw new Error(`${label} must be an internal path or a valid URL.`); }
}
function safeOptionalUrl(input: string | null, label: string): string | null {
  if (!input) return null;
  try { const url = new URL(input); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); return url.toString(); }
  catch { throw new Error(`${label} must be a valid http or https URL.`); }
}
function destination(path: string, type: "success" | "error", message: string): string { return `${path}?${type}=${encodeURIComponent(message)}`; }
function fail(path: string, error: unknown): never { const message = error instanceof Error ? error.message : "The operation could not be completed."; redirect(destination(path, "error", message)); }
function refreshProfile() { revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/homepage"); revalidatePath("/admin/skills"); revalidatePath("/admin/experience"); }
async function audit(eventType: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase.from("audit_events").insert({ actor_id: admin.id, event_type: eventType, entity_type: entityType, entity_id: entityId, metadata });
}

export async function updateHomepageAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  try {
    const processNumbers = lines(formData, "process_numbers");
    const processTitles = lines(formData, "process_titles");
    const processDescriptions = lines(formData, "process_descriptions");
    const processItems: ProcessItem[] = processTitles.map((title, index) => ({ number: processNumbers[index] || String(index + 1).padStart(2, "0"), title, description: processDescriptions[index] || "" })).filter((item) => item.title && item.description);
    const statValues = lines(formData, "stat_values");
    const statLabels = lines(formData, "stat_labels");
    const stats = statLabels.map((label, index) => ({ value: statValues[index] || "—", label })).filter((item) => item.label);
    const visibility = Object.fromEntries(sectionKeys.map((key) => [key, checked(formData, `section_${key}`)]));
    const socialLinks = { github: safeHref(value(formData, "github_url"), "GitHub URL"), linkedin: safeHref(value(formData, "linkedin_url"), "LinkedIn URL"), website: safeHref(value(formData, "website_url"), "Website URL") };
    const payload = {
      owner_name: value(formData, "owner_name"), professional_title: value(formData, "professional_title"), short_bio: value(formData, "short_bio"), contact_email: value(formData, "contact_email"), location: value(formData, "location"), availability: value(formData, "availability"), social_links: socialLinks,
      hero_eyebrow: value(formData, "hero_eyebrow"), hero_heading: value(formData, "hero_heading"), hero_emphasis: value(formData, "hero_emphasis"), hero_lead: value(formData, "hero_lead"), hero_primary_label: value(formData, "hero_primary_label"), hero_primary_href: safeHref(value(formData, "hero_primary_href"), "Primary button link"), hero_secondary_label: value(formData, "hero_secondary_label"), hero_secondary_href: safeHref(value(formData, "hero_secondary_href"), "Secondary button link"),
      about_eyebrow: value(formData, "about_eyebrow"), about_title: value(formData, "about_title"), about_description: value(formData, "about_description"), about_paragraphs: lines(formData, "about_paragraphs"), positioning_title: value(formData, "positioning_title"), positioning_points: lines(formData, "positioning_points"),
      process_items: processItems, work_principles: lines(formData, "work_principles"), homepage_stats: stats, homepage_section_visibility: visibility,
      cta_eyebrow: value(formData, "cta_eyebrow"), cta_title: value(formData, "cta_title"), cta_description: value(formData, "cta_description"), cta_primary_label: value(formData, "cta_primary_label"), cta_primary_href: safeHref(value(formData, "cta_primary_href"), "CTA primary link"), cta_secondary_label: value(formData, "cta_secondary_label"), cta_secondary_href: safeHref(value(formData, "cta_secondary_href"), "CTA secondary link"), updated_by: admin.id,
    };
    if (!payload.owner_name || !payload.professional_title || payload.hero_lead.length < 30 || payload.about_paragraphs.length === 0) throw new Error("Owner name, professional title, a useful hero introduction and at least one About paragraph are required.");
    const { error } = await supabase.from("site_settings").update(payload).eq("id", "primary");
    if (error) throw error;
    await audit("homepage.updated", "site_settings", "primary", { sections: visibility });
    refreshProfile();
  } catch (error) { fail("/admin/homepage", error); }
  redirect(destination("/admin/homepage", "success", "Homepage content saved and public sections revalidated."));
}

export async function createSkillGroupAction(formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try {
    const title = value(formData, "title"); if (title.length < 2) throw new Error("Group title is required.");
    const icon = icons.has(value(formData, "icon")) ? value(formData, "icon") : "layers";
    const accent = accents.has(value(formData, "accent")) ? value(formData, "accent") : "blue";
    const { data, error } = await supabase.from("skill_groups").insert({ title, icon, description: optional(formData, "description"), accent, sort_order: integer(formData, "sort_order", 100), is_active: checked(formData, "is_active"), is_featured: checked(formData, "is_featured") }).select("id").single();
    if (error) throw error; await audit("skill_group.created", "skill_group", data.id, { title }); refreshProfile();
  } catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Skill group created."));
}

export async function updateSkillGroupAction(id: string, formData: FormData) {
  await requireAdmin(); const supabase = await createClient();
  try {
    const title = value(formData, "title"); if (title.length < 2) throw new Error("Group title is required.");
    const { error } = await supabase.from("skill_groups").update({ title, icon: icons.has(value(formData, "icon")) ? value(formData, "icon") : "layers", description: optional(formData, "description"), accent: accents.has(value(formData, "accent")) ? value(formData, "accent") : "blue", sort_order: integer(formData, "sort_order"), is_active: checked(formData, "is_active"), is_featured: checked(formData, "is_featured") }).eq("id", id);
    if (error) throw error; await audit("skill_group.updated", "skill_group", id, { title }); refreshProfile();
  } catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Skill group updated."));
}

export async function deleteSkillGroupAction(id: string) {
  await requireAdmin(); const supabase = await createClient();
  try {
    const { count, error: countError } = await supabase.from("skills").select("id", { count: "exact", head: true }).eq("group_id", id); if (countError) throw countError;
    if ((count ?? 0) > 0) throw new Error("Move or delete the skills in this group before deleting the group.");
    const { error } = await supabase.from("skill_groups").delete().eq("id", id); if (error) throw error; await audit("skill_group.deleted", "skill_group", id); refreshProfile();
  } catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Empty skill group deleted."));
}

export async function createSkillAction(formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try {
    const name = value(formData, "name"); const groupId = value(formData, "group_id"); if (name.length < 2 || !groupId) throw new Error("Skill name and group are required.");
    const proficiencyLevel = integer(formData, "proficiency_level", -1); if (proficiencyLevel > 100) throw new Error("Proficiency level cannot exceed 100.");
    const { data, error } = await supabase.from("skills").insert({ group_id: groupId, name, description: optional(formData, "description"), proficiency: optional(formData, "proficiency"), proficiency_level: proficiencyLevel >= 0 ? proficiencyLevel : null, years_experience: decimal(formData, "years_experience"), evidence_url: safeOptionalUrl(optional(formData, "evidence_url"), "Evidence URL"), is_learning: checked(formData, "is_learning"), is_featured: checked(formData, "is_featured"), is_active: checked(formData, "is_active"), sort_order: integer(formData, "sort_order", 100), updated_at: new Date().toISOString() }).select("id").single();
    if (error) throw error; await audit("skill.created", "skill", data.id, { name, group_id: groupId, actor_id: admin.id }); refreshProfile();
  } catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Skill created."));
}

export async function updateSkillAction(id: string, formData: FormData) {
  await requireAdmin(); const supabase = await createClient();
  try {
    const name = value(formData, "name"); const groupId = value(formData, "group_id"); if (name.length < 2 || !groupId) throw new Error("Skill name and group are required.");
    const proficiencyLevel = integer(formData, "proficiency_level", -1); if (proficiencyLevel > 100) throw new Error("Proficiency level cannot exceed 100.");
    const { error } = await supabase.from("skills").update({ group_id: groupId, name, description: optional(formData, "description"), proficiency: optional(formData, "proficiency"), proficiency_level: proficiencyLevel >= 0 ? proficiencyLevel : null, years_experience: decimal(formData, "years_experience"), evidence_url: safeOptionalUrl(optional(formData, "evidence_url"), "Evidence URL"), is_learning: checked(formData, "is_learning"), is_featured: checked(formData, "is_featured"), is_active: checked(formData, "is_active"), sort_order: integer(formData, "sort_order") }).eq("id", id);
    if (error) throw error; await audit("skill.updated", "skill", id, { name, group_id: groupId }); refreshProfile();
  } catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Skill updated."));
}

export async function deleteSkillAction(id: string) {
  await requireAdmin(); const supabase = await createClient();
  try { const { data, error: loadError } = await supabase.from("skills").select("name,is_active").eq("id", id).single(); if (loadError) throw loadError; if (data.is_active) throw new Error("Hide the skill before permanently deleting it."); const { error } = await supabase.from("skills").delete().eq("id", id); if (error) throw error; await audit("skill.deleted", "skill", id, { name: data.name }); refreshProfile(); }
  catch (error) { fail("/admin/skills", error); }
  redirect(destination("/admin/skills", "success", "Hidden skill permanently deleted."));
}

function experiencePayload(formData: FormData, adminId: string) {
  const title = value(formData, "title"), organization = value(formData, "organization"), summary = value(formData, "summary");
  if (title.length < 3 || organization.length < 2 || summary.length < 20) throw new Error("Title, organization and a summary of at least 20 characters are required.");
  const startDate = optional(formData, "start_date"), endDate = optional(formData, "end_date"), current = checked(formData, "is_current");
  if (startDate && endDate && endDate < startDate) throw new Error("End date cannot be earlier than start date.");
  return { title, organization, employment_type: optional(formData, "employment_type"), location: optional(formData, "location"), start_date: startDate, end_date: current ? null : endDate, is_current: current, period_label: optional(formData, "period_label"), summary, achievements: lines(formData, "achievements"), technologies: lines(formData, "technologies"), is_featured: checked(formData, "is_featured"), is_active: checked(formData, "is_active"), sort_order: integer(formData, "sort_order", 100), updated_by: adminId };
}
export async function createExperienceAction(formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try { const payload = experiencePayload(formData, admin.id); const { data, error } = await supabase.from("experience_entries").insert({ ...payload, created_by: admin.id }).select("id").single(); if (error) throw error; await audit("experience.created", "experience", data.id, { title: payload.title }); refreshProfile(); }
  catch (error) { fail("/admin/experience/new", error); }
  redirect(destination("/admin/experience", "success", "Experience entry created."));
}
export async function updateExperienceAction(id: string, formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try { const payload = experiencePayload(formData, admin.id); const { error } = await supabase.from("experience_entries").update(payload).eq("id", id); if (error) throw error; await audit("experience.updated", "experience", id, { title: payload.title }); refreshProfile(); }
  catch (error) { fail(`/admin/experience/${id}/edit`, error); }
  redirect(destination("/admin/experience", "success", "Experience entry updated."));
}
export async function deleteExperienceAction(id: string) {
  await requireAdmin(); const supabase = await createClient();
  try { const { data, error: loadError } = await supabase.from("experience_entries").select("title,is_active").eq("id", id).single(); if (loadError) throw loadError; if (data.is_active) throw new Error("Hide the experience entry before permanently deleting it."); const { error } = await supabase.from("experience_entries").delete().eq("id", id); if (error) throw error; await audit("experience.deleted", "experience", id, { title: data.title }); refreshProfile(); }
  catch (error) { fail("/admin/experience", error); }
  redirect(destination("/admin/experience", "success", "Hidden experience entry permanently deleted."));
}

export async function createServiceAction(formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try { const title = value(formData, "title"), description = value(formData, "description"); if (title.length < 3 || description.length < 20) throw new Error("Service title and a description of at least 20 characters are required."); const { data, error } = await supabase.from("services").insert({ title, description, icon: icons.has(value(formData, "icon")) ? value(formData, "icon") : "spark", accent: accents.has(value(formData, "accent")) ? value(formData, "accent") : "blue", is_active: checked(formData, "is_active"), sort_order: integer(formData, "sort_order", 100), created_by: admin.id, updated_by: admin.id }).select("id").single(); if (error) throw error; await audit("service.created", "service", data.id, { title }); refreshProfile(); }
  catch (error) { fail("/admin/homepage", error); }
  redirect(destination("/admin/homepage", "success", "Service created."));
}
export async function updateServiceAction(id: string, formData: FormData) {
  const admin = await requireAdmin(); const supabase = await createClient();
  try { const title = value(formData, "title"), description = value(formData, "description"); if (title.length < 3 || description.length < 20) throw new Error("Service title and description are required."); const { error } = await supabase.from("services").update({ title, description, icon: icons.has(value(formData, "icon")) ? value(formData, "icon") : "spark", accent: accents.has(value(formData, "accent")) ? value(formData, "accent") : "blue", is_active: checked(formData, "is_active"), sort_order: integer(formData, "sort_order"), updated_by: admin.id }).eq("id", id); if (error) throw error; await audit("service.updated", "service", id, { title }); refreshProfile(); }
  catch (error) { fail("/admin/homepage", error); }
  redirect(destination("/admin/homepage", "success", "Service updated."));
}
export async function deleteServiceAction(id: string) {
  await requireAdmin(); const supabase = await createClient();
  try { const { data, error: loadError } = await supabase.from("services").select("title,is_active").eq("id", id).single(); if (loadError) throw loadError; if (data.is_active) throw new Error("Hide the service before permanently deleting it."); const { error } = await supabase.from("services").delete().eq("id", id); if (error) throw error; await audit("service.deleted", "service", id, { title: data.title }); refreshProfile(); }
  catch (error) { fail("/admin/homepage", error); }
  redirect(destination("/admin/homepage", "success", "Hidden service permanently deleted."));
}
