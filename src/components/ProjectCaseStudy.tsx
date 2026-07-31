import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { PortfolioProject } from "@/types/project";

export function ProjectCaseStudy({ project, preview = false }: { project: PortfolioProject; preview?: boolean }) {
  return (
    <>
      {preview ? (
        <div className="preview-banner">
          <div><strong>Admin preview</strong><span>This project is currently {project.publicationStatus}.</span></div>
          <div><Link className="button button-secondary" href={`/admin/projects/${project.id}/edit`}>Edit project</Link><Link className="button button-ghost" href="/admin/projects">Back to projects</Link></div>
        </div>
      ) : null}
      <section className={`case-hero section-shell accent-${project.accent}`}>
        <div className="container case-hero-grid">
          <div>
            {!preview ? <Link href="/projects" className="back-link">← Back to projects</Link> : null}
            <div className="project-meta large">
              <span>{project.category}</span>
              <span className={`status status-${project.projectState.replaceAll("_", "-")}`}>{project.status}</span>
            </div>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <div className="tag-row large-tags">
              {project.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="hero-actions">
              {project.liveUrl ? <a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">View live project <Icon name="external" size={17}/></a> : null}
              {project.sourceUrl ? <a className={project.liveUrl ? "button button-secondary" : "button button-primary"} href={project.sourceUrl} target="_blank" rel="noreferrer">View source <Icon name="github" size={17}/></a> : null}
              {!preview ? <Link className="button button-secondary" href="/contact">Discuss this work</Link> : null}
            </div>
          </div>
          <div className="case-visual">
            {project.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="project-cover-image" src={project.coverImageUrl} alt={project.coverImageAlt ?? `${project.title} project cover`} />
            ) : (
              <div className="project-visual large-project-visual">
                <div className="visual-topbar"><i/><i/><i/></div>
                <div className="visual-layout"><span className="visual-sidebar"/><div className="visual-content"><span className="visual-kpi wide"/><span className="visual-kpi"/><span className="visual-kpi"/><span className="visual-chart"/><span className="visual-chart small-chart"/></div></div>
              </div>
            )}
            <small>{project.coverImageUrl ? "Project artwork" : "Project screenshot placeholder"}</small>
          </div>
        </div>
      </section>

      {project.gallery.length ? <section className="section-shell project-gallery-section"><div className="container"><div className="section-row"><div><span className="eyebrow">Project media</span><h2>Screenshots and supporting evidence</h2></div></div><div className="project-gallery-grid">{project.gallery.map((asset) => <figure key={asset.id}><img src={asset.publicUrl} alt={asset.altText ?? `${project.title} screenshot`}/>{asset.caption ? <figcaption>{asset.caption}</figcaption> : null}</figure>)}</div></div></section> : null}

      <section className="section-shell case-content-section">
        <div className="container case-content-grid">
          <article className="case-main">
            <span className="eyebrow">Overview</span>
            <h2>What this project is about</h2>
            <p>{project.description}</p>

            {project.problemStatement ? <><span className="eyebrow case-subheading">Problem</span><h2>The need behind the project</h2><p>{project.problemStatement}</p></> : null}
            {project.solutionOverview ? <><span className="eyebrow case-subheading">Solution</span><h2>How the work was approached</h2><p>{project.solutionOverview}</p></> : null}

            {project.outcomes.length ? (
              <div className="case-outcomes">
                <span className="eyebrow">Outcomes</span>
                <h2>What the project produced</h2>
                <ul className="check-list">{project.outcomes.map((item) => <li key={item}><Icon name="check" size={17}/>{item}</li>)}</ul>
              </div>
            ) : (
              <div className="case-callout"><Icon name="spark" size={24}/><div><strong>Portfolio development note</strong><p>Detailed outcomes and evidence will continue to be documented as this project advances.</p></div></div>
            )}
          </article>
          <aside className="case-sidebar">
            <div className="detail-card"><span className="eyebrow">Key highlights</span><ul className="check-list">{project.highlights.map((item) => <li key={item}><Icon name="check" size={17}/>{item}</li>)}</ul></div>
            <div className="detail-card"><span className="eyebrow">My role</span><h3>{project.role}</h3></div>
            <div className="detail-card project-meta-card"><span className="eyebrow">Project record</span><dl><div><dt>State</dt><dd>{project.status}</dd></div><div><dt>Version</dt><dd>{project.version}</dd></div>{project.publishedAt ? <div><dt>Published</dt><dd>{new Date(project.publishedAt).toLocaleDateString("en-GB")}</dd></div> : null}</dl></div>
          </aside>
        </div>
      </section>
    </>
  );
}
