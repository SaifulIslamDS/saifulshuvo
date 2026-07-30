import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Project } from "@/data/portfolio";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`project-card accent-${project.accent}`}>
      <div className="project-visual" aria-hidden="true">
        <div className="visual-topbar"><i /><i /><i /></div>
        <div className="visual-layout">
          <span className="visual-sidebar" />
          <div className="visual-content">
            <span className="visual-kpi wide" />
            <span className="visual-kpi" />
            <span className="visual-kpi" />
            <span className="visual-chart" />
          </div>
        </div>
      </div>
      <div className="project-card-body">
        <div className="project-meta">
          <span>{project.category}</span>
          <span className={`status status-${project.status.toLowerCase().replaceAll(" ", "-")}`}>
            {project.status}
          </span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="tag-row">
          {project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
        </div>
        <Link className="text-link" href={`/projects/${project.slug}`}>
          View case study <Icon name="arrow" size={17} />
        </Link>
      </div>
    </article>
  );
}
