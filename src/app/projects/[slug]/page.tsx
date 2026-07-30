import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/data/portfolio";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project
    ? { title: project.title, description: project.summary }
    : { title: "Project not found" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className={`case-hero section-shell accent-${project.accent}`}>
          <div className="container case-hero-grid">
            <div>
              <Link href="/projects" className="back-link">← Back to projects</Link>
              <div className="project-meta large">
                <span>{project.category}</span>
                <span className={`status status-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span>
              </div>
              <h1>{project.title}</h1>
              <p>{project.summary}</p>
              <div className="tag-row large-tags">
                {project.stack.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="hero-actions">
                {project.liveUrl ? (
                  <a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">
                    View live project <Icon name="external" size={17} />
                  </a>
                ) : null}
                {project.sourceUrl ? (
                  <a className={project.liveUrl ? "button button-secondary" : "button button-primary"} href={project.sourceUrl} target="_blank" rel="noreferrer">
                    View source <Icon name="github" size={17} />
                  </a>
                ) : null}
                <Link className="button button-secondary" href="/contact">Discuss this work</Link>
              </div>
            </div>
            <div className="case-visual">
              <div className="project-visual large-project-visual">
                <div className="visual-topbar"><i /><i /><i /></div>
                <div className="visual-layout">
                  <span className="visual-sidebar" />
                  <div className="visual-content">
                    <span className="visual-kpi wide" /><span className="visual-kpi" /><span className="visual-kpi" />
                    <span className="visual-chart" /><span className="visual-chart small-chart" />
                  </div>
                </div>
              </div>
              <small>Project screenshot placeholder</small>
            </div>
          </div>
        </section>

        <section className="section-shell case-content-section">
          <div className="container case-content-grid">
            <article className="case-main">
              <span className="eyebrow">Overview</span>
              <h2>What this project is about</h2>
              <p>{project.description}</p>

              <span className="eyebrow case-subheading">Approach</span>
              <h2>Designed around workflow and evidence</h2>
              <p>
                The project is structured around clear user journeys, maintainable components and incremental delivery.
                Features are treated as verifiable milestones so that design, implementation, testing and documentation stay aligned.
              </p>

              <div className="case-callout">
                <Icon name="spark" size={24} />
                <div><strong>Current portfolio note</strong><p>The project summary and verified links are integrated. Project screenshots, deeper metrics and CMS-managed case-study content will be added in later releases.</p></div>
              </div>
            </article>
            <aside className="case-sidebar">
              <div className="detail-card">
                <span className="eyebrow">Key highlights</span>
                <ul className="check-list">
                  {project.highlights.map((item) => <li key={item}><Icon name="check" size={17} /> {item}</li>)}
                </ul>
              </div>
              <div className="detail-card">
                <span className="eyebrow">My role</span>
                <h3>{project.role}</h3>
                <p>The project content is currently maintained in code and will move to the planned portfolio CMS in a later release.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
