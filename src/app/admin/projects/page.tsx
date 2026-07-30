import { Icon } from "@/components/Icon";
import { projects } from "@/data/portfolio";

export default function AdminProjectsPage() {
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Content manager</span><h1>Projects</h1><p>Create, organize and publish portfolio case studies.</p></div><button className="button button-primary"><Icon name="plus" size={17}/> Add project</button></div>
      <section className="admin-panel">
        <div className="toolbar"><div className="search-field"><Icon name="search" size={17}/><input placeholder="Search projects..." /></div><select defaultValue="all"><option value="all">All statuses</option><option>Live</option><option>In development</option><option>Portfolio</option></select><select defaultValue="newest"><option value="newest">Newest first</option><option>Oldest first</option></select></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Stack</th><th>Featured</th><th>Actions</th></tr></thead><tbody>{projects.map((project) => <tr key={project.slug}><td><div className="table-project"><span className={`table-thumb accent-${project.accent}`}><Icon name="folder" size={18}/></span><div><strong>{project.title}</strong><small>/{project.slug}</small></div></div></td><td>{project.category}</td><td><span className={`status status-${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span></td><td><div className="mini-tags">{project.stack.slice(0,2).map(item => <span key={item}>{item}</span>)}</div></td><td>{project.featured ? "Yes" : "No"}</td><td><div className="table-actions"><button aria-label="Preview"><Icon name="eye" size={16}/></button><button aria-label="Edit"><Icon name="edit" size={16}/></button></div></td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}
