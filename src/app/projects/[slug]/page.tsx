import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicProjectBySlug } from "@/lib/projects/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  return project
    ? { title: project.seoTitle || project.title, description: project.seoDescription || project.summary }
    : { title: "Project not found" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();
  return <><SiteHeader/><main className="inner-page"><ProjectCaseStudy project={project}/></main><SiteFooter/></>;
}
