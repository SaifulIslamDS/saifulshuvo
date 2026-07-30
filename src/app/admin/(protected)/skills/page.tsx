import { Icon } from "@/components/Icon";
import { skillGroups } from "@/data/portfolio";

export default function AdminSkillsPage() {
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Profile content</span><h1>Skills</h1><p>Organize capabilities by category and control public visibility.</p></div><button className="button button-primary"><Icon name="plus" size={17}/> Add skill</button></div>
      <div className="admin-skill-grid">{skillGroups.map(group => <section className="admin-panel skill-admin-card" key={group.title}><div className="panel-head"><div className="skill-title"><span className="icon-box small"><Icon name={group.icon} size={19}/></span><div><h2>{group.title}</h2><small>{group.skills.length} skills</small></div></div><button><Icon name="edit" size={16}/></button></div><div className="sortable-list">{group.skills.map((skill, index) => <div key={skill}><span className="drag-handle">⋮⋮</span><strong>{skill}</strong><span className={`visibility ${index < 4 ? "visible" : ""}`}>{index < 4 ? "Featured" : "Visible"}</span><button><Icon name="edit" size={15}/></button></div>)}</div></section>)}</div>
    </>
  );
}
