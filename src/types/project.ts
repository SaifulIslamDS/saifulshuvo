import type { MediaAsset } from "@/types/media";
export type ProjectPublicationStatus = "draft" | "published" | "archived";
export type ProjectState = "live" | "in_development" | "portfolio" | "deployed";

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  publicationStatus: ProjectPublicationStatus;
  projectState: ProjectState;
  status: string;
  featured: boolean;
  stack: string[];
  highlights: string[];
  accent: string;
  role: string;
  sourceUrl?: string;
  liveUrl?: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  problemStatement: string;
  solutionOverview: string;
  outcomes: string[];
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
  gallery: MediaAsset[];
  version: number;
  publishedAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function projectStateLabel(state: ProjectState): string {
  const labels: Record<ProjectState, string> = {
    live: "Live",
    in_development: "In development",
    portfolio: "Portfolio",
    deployed: "Deployed",
  };
  return labels[state];
}

export function publicationStatusLabel(status: ProjectPublicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
