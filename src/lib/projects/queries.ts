import { projects as staticProjects } from "@/data/portfolio";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { mapProjectRow } from "@/lib/projects/project-mapper";
import { getMediaAssetById, getProjectGallery } from "@/lib/media/queries";
import type { PortfolioProject, ProjectPublicationStatus } from "@/types/project";

function staticFallback(): PortfolioProject[] {
  return staticProjects.map((project, index) => ({
    id: `static-${project.slug}`,
    slug: project.slug,
    title: project.title,
    category: project.category,
    summary: project.summary,
    description: project.description,
    publicationStatus: "published",
    projectState:
      project.status === "Live"
        ? "live"
        : project.status === "Portfolio"
          ? "portfolio"
          : project.status === "Deployed"
            ? "deployed"
            : "in_development",
    status: project.status,
    featured: project.featured,
    stack: project.stack,
    highlights: project.highlights,
    accent: project.accent,
    role: project.role,
    sourceUrl: project.sourceUrl,
    liveUrl: project.liveUrl,
    sortOrder: (index + 1) * 10,
    problemStatement: "",
    solutionOverview: "",
    outcomes: [],
    version: 1,
    gallery: [],
  }));
}

const projectSelect = `
  id, slug, title, category, summary, description,
  publication_status, project_state, is_featured, stack, highlights,
  accent, role, source_url, live_url, sort_order, seo_title,
  seo_description, problem_statement, solution_overview, outcomes,
  cover_image_url, cover_image_asset_id, version, published_at, archived_at, created_at, updated_at
`;

export async function getPublicProjects(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PortfolioProject[]> {
  if (!hasSupabasePublicConfig()) {
    const fallback = staticFallback().filter((project) => !options?.featuredOnly || project.featured);
    return typeof options?.limit === "number" ? fallback.slice(0, options.limit) : fallback;
  }

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(projectSelect)
    .eq("publication_status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (typeof options?.limit === "number") query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("Unable to load public projects:", error.message);
    return [];
  }

  return Promise.all((data ?? []).map(async (row) => {
    const project = mapProjectRow(row);
    const [cover, gallery] = await Promise.all([getMediaAssetById(project.coverImageAssetId), getProjectGallery(project.id)]);
    project.coverImageAlt = cover?.altText;
    project.gallery = gallery;
    return project;
  }));
}

export async function getPublicProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  if (!hasSupabasePublicConfig()) {
    return staticFallback().find((project) => project.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error) {
    console.error("Unable to load project:", error.message);
    return null;
  }
  if (!data) return null;
  const project = mapProjectRow(data);
  const [cover, gallery] = await Promise.all([getMediaAssetById(project.coverImageAssetId), getProjectGallery(project.id)]);
    project.coverImageAlt = cover?.altText;
    project.gallery = gallery;
  return project;
}

export async function getAdminProjects(filters?: {
  query?: string;
  status?: ProjectPublicationStatus | "all";
}): Promise<PortfolioProject[]> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(projectSelect)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("publication_status", filters.status);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load projects: ${error.message}`);

  const mapped: PortfolioProject[] = await Promise.all((data ?? []).map(async (row) => {
    const project = mapProjectRow(row);
    const [cover, gallery] = await Promise.all([getMediaAssetById(project.coverImageAssetId), getProjectGallery(project.id)]);
    project.coverImageAlt = cover?.altText;
    project.gallery = gallery;
    return project;
  }));
  const term = filters?.query?.trim().toLowerCase();
  if (!term) return mapped;
  return mapped.filter((project) =>
    [project.title, project.category, project.slug].some((value) => value.toLowerCase().includes(term)),
  );
}

export async function getAdminProjectById(id: string): Promise<PortfolioProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load project: ${error.message}`);
  if (!data) return null;
  const project = mapProjectRow(data);
  const [cover, gallery] = await Promise.all([getMediaAssetById(project.coverImageAssetId), getProjectGallery(project.id)]);
    project.coverImageAlt = cover?.altText;
    project.gallery = gallery;
  return project;
}

export async function getAdminProjectCounts(): Promise<Record<ProjectPublicationStatus | "total", number>> {
  const projects = await getAdminProjects();
  return {
    total: projects.length,
    draft: projects.filter((project) => project.publicationStatus === "draft").length,
    published: projects.filter((project) => project.publicationStatus === "published").length,
    archived: projects.filter((project) => project.publicationStatus === "archived").length,
  };
}
