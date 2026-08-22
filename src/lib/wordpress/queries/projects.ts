import { cache } from "react";
import { MEDIA_FIELDS, choice, mediaNode, numberValue, repeatText, stripHtml, text, type WpMediaConnection, type WpMediaEdge } from "@/lib/wordpress/helpers";
import { mapWordPressMedia } from "@/lib/wordpress/media-mapper";
import { wpGraphql } from "@/lib/wordpress/client";
import { projectStateLabel, type PortfolioProject, type ProjectState } from "@/types/project";

export type ProjectQueryOptions = { featuredOnly?: boolean; limit?: number };

type ProjectNode = {
  id: string;
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  date?: string | null;
  modified?: string | null;
  featuredImage?: WpMediaEdge;
  projectCategories?: { nodes?: Array<{ id: string; name?: string | null; slug?: string | null }> | null } | null;
  technologies?: { nodes?: Array<{ id: string; name?: string | null; slug?: string | null }> | null } | null;
  projectFields?: {
    summary?: string | null;
    projectState?: string[] | string | null;
    featured?: boolean | null;
    accent?: string[] | string | null;
    role?: string | null;
    sourceUrl?: string | null;
    liveUrl?: string | null;
    startDate?: string | null;
    completionDate?: string | null;
    highlights?: Array<{ text?: string | null }> | null;
    problemStatement?: string | null;
    solutionOverview?: string | null;
    outcomes?: Array<{ text?: string | null }> | null;
    coverImage?: WpMediaEdge;
    gallery?: WpMediaConnection;
    sortOrder?: number | null;
  } | null;
  seoFields?: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    ogImage?: WpMediaEdge;
    featuredPost?: boolean | null;
    sortOrder?: number | null;
  } | null;
};

type ProjectsQuery = { projects?: { nodes?: ProjectNode[] | null } | null };

const PROJECTS_QUERY = `
  query SaifulShuvoProjects {
    projects(first: 100) {
      nodes {
        id
        databaseId
        slug
        title
        excerpt
        content
        date
        modified
        featuredImage { node { ${MEDIA_FIELDS} } }
        projectCategories(first: 20) { nodes { id name slug } }
        technologies(first: 100) { nodes { id name slug } }
        projectFields {
          summary
          projectState
          featured
          accent
          role
          sourceUrl
          liveUrl
          startDate
          completionDate
          highlights { text }
          problemStatement
          solutionOverview
          outcomes { text }
          coverImage { node { ${MEDIA_FIELDS} } }
          gallery { nodes { ${MEDIA_FIELDS} } }
          sortOrder
        }
        seoFields {
          seoTitle
          seoDescription
          canonicalUrl
          ogImage { node { ${MEDIA_FIELDS} } }
          featuredPost
          sortOrder
        }
      }
    }
  }
`;

function projectState(value: unknown): ProjectState {
  const state = choice(value, "portfolio");
  return state === "live" || state === "in_development" || state === "deployed" || state === "portfolio"
    ? state
    : "portfolio";
}

function mapProject(node: ProjectNode): PortfolioProject {
  const fields = node.projectFields;
  const state = projectState(fields?.projectState);
  const cover = mapWordPressMedia(mediaNode(fields?.coverImage) || mediaNode(node.featuredImage), "project");
  const gallery = (fields?.gallery?.nodes ?? [])
    .map((item) => mapWordPressMedia(item, "project"))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const category = text(node.projectCategories?.nodes?.[0]?.name, "Project");
  const stack = (node.technologies?.nodes ?? []).map((item) => text(item.name)).filter(Boolean);

  return {
    id: node.id,
    slug: text(node.slug),
    title: text(node.title),
    category,
    summary: text(fields?.summary) || stripHtml(text(node.excerpt)),
    description: stripHtml(text(node.content)),
    publicationStatus: "published",
    projectState: state,
    status: projectStateLabel(state),
    featured: fields?.featured ?? false,
    stack,
    highlights: repeatText(fields?.highlights),
    accent: choice(fields?.accent, "blue"),
    role: text(fields?.role),
    sourceUrl: text(fields?.sourceUrl) || undefined,
    liveUrl: text(fields?.liveUrl) || undefined,
    sortOrder: numberValue(fields?.sortOrder ?? node.seoFields?.sortOrder, 100),
    seoTitle: text(node.seoFields?.seoTitle) || undefined,
    seoDescription: text(node.seoFields?.seoDescription) || undefined,
    problemStatement: stripHtml(text(fields?.problemStatement)),
    solutionOverview: stripHtml(text(fields?.solutionOverview)),
    outcomes: repeatText(fields?.outcomes),
    coverImageUrl: cover?.publicUrl,
    coverImageAssetId: cover?.id,
    coverImageAlt: cover?.altText,
    gallery,
    version: 1,
    publishedAt: node.date || undefined,
    createdAt: node.date || undefined,
    updatedAt: node.modified || node.date || undefined,
  };
}

const getAllPublicProjects = cache(async (): Promise<PortfolioProject[]> => {
  const data = await wpGraphql<ProjectsQuery>(PROJECTS_QUERY);
  return (data.projects?.nodes ?? [])
    .map(mapProject)
    .filter((project) => project.slug && project.title)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
});

export async function getPublicProjects(options: ProjectQueryOptions = {}): Promise<PortfolioProject[]> {
  let projects = await getAllPublicProjects();
  if (options.featuredOnly) projects = projects.filter((project) => project.featured);
  if (options.limit && options.limit > 0) projects = projects.slice(0, options.limit);
  return projects;
}

export async function getPublicProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const projects = await getAllPublicProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getPublicProjectSlugs(): Promise<string[]> {
  return (await getAllPublicProjects()).map((project) => project.slug).filter(Boolean);
}
