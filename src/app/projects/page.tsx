import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicProjects } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Projects",
  description: "Analytics, AI, SaaS and web application projects by Saiful Islam.",
};

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return (
    <><SiteHeader/><main id="main-content" className="inner-page"><section className="page-hero section-shell"><div className="container"><SectionHeading eyebrow="Project portfolio" title="Building, learning and solving through real projects" description="A growing collection of analytics case studies, software products and workflow applications. Each project represents structured learning, practical execution and documented iteration."/><div className="filter-pills" aria-label="Project categories"><span className="active">All work</span><span>Data & BI</span><span>AI products</span><span>Web applications</span><span>Business systems</span></div></div></section><section className="section-shell compact-top"><div className="container projects-grid">{projects.map((project) => <ProjectCard key={project.id} project={project}/>)}</div></section></main><SiteFooter/></>
  );
}
