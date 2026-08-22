import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicProjectBySlug, getPublicProjectSlugs } from "@/lib/wordpress/queries/projects";
import { getSiteUrl } from "@/lib/wordpress/env";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublicProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  const canonical = `/projects/${project.slug}`;
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    alternates: { canonical },
    openGraph: { title: project.seoTitle || project.title, description: project.seoDescription || project.summary, url: canonical, type: "article", images: project.coverImageUrl ? [{ url: project.coverImageUrl, alt: project.coverImageAlt }] : undefined },
    twitter: { card: project.coverImageUrl ? "summary_large_image" : "summary", title: project.seoTitle || project.title, description: project.seoDescription || project.summary, images: project.coverImageUrl ? [project.coverImageUrl] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.seoDescription || project.summary,
    url: `${siteUrl}/projects/${project.slug}`,
    image: project.coverImageUrl,
    creator: { "@type": "Person", name: "Saiful Islam", url: siteUrl },
    keywords: project.stack.join(", "),
    datePublished: project.publishedAt,
    dateModified: project.updatedAt,
  };
  return <><JsonLd data={structuredData}/><SiteHeader/><main id="main-content" className="inner-page"><ProjectCaseStudy project={project}/></main><SiteFooter/></>;
}
