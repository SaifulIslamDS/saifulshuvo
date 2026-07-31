import type { PortfolioProject, ProjectState } from "@/types/project";
import { projectStateLabel } from "@/types/project";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  publication_status: "draft" | "published" | "archived";
  project_state: ProjectState;
  is_featured: boolean;
  stack: string[] | null;
  highlights: string[] | null;
  accent: string;
  role: string;
  source_url: string | null;
  live_url: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  problem_statement?: string | null;
  solution_overview?: string | null;
  outcomes?: string[] | null;
  cover_image_url?: string | null;
  cover_image_asset_id?: string | null;
  version?: number | null;
  published_at: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

export function mapProjectRow(row: ProjectRow): PortfolioProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    publicationStatus: row.publication_status,
    projectState: row.project_state,
    status: projectStateLabel(row.project_state),
    featured: row.is_featured,
    stack: row.stack ?? [],
    highlights: row.highlights ?? [],
    accent: row.accent,
    role: row.role,
    sourceUrl: row.source_url ?? undefined,
    liveUrl: row.live_url ?? undefined,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    problemStatement: row.problem_statement ?? "",
    solutionOverview: row.solution_overview ?? "",
    outcomes: row.outcomes ?? [],
    coverImageUrl: row.cover_image_url ?? undefined,
    coverImageAssetId: row.cover_image_asset_id ?? undefined,
    gallery: [],
    version: row.version ?? 1,
    publishedAt: row.published_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
