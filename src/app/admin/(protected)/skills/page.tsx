import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createSkillAction, createSkillGroupAction, deleteSkillAction, deleteSkillGroupAction, updateSkillAction, updateSkillGroupAction } from "@/app/admin/(protected)/profile/actions";
import { getSkillGroups } from "@/lib/profile/queries";

const iconOptions = ["chart", "brain", "briefcase", "code", "layers", "search", "spark", "database"];
const accentOptions = ["blue", "cyan", "violet", "green", "orange"];
type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function AdminSkillsPage({ searchParams }: Props) {
  const [params, groups] = await Promise.all([searchParams, getSkillGroups({ admin: true })]);
  const skills = groups.flatMap((group) => group.skills);
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Profile content</span><h1>Skills CMS</h1><p>Create skill groups, organise capabilities, show learning status and control homepage visibility.</p></div><a href="#create-skill" className="button button-primary"><Icon name="plus" size={17}/> Add skill</a></div>
      <AdminFlash success={params.success} error={params.error}/>
      <div className="admin-stat-grid profile-stat-grid">
        <article><span className="icon-box small"><Icon name="layers" size={20}/></span><div><small>Groups</small><strong>{groups.length}</strong><span>{groups.filter((group) => group.active).length} visible</span></div></article>
        <article><span className="icon-box small"><Icon name="spark" size={20}/></span><div><small>Skills</small><strong>{skills.length}</strong><span>{skills.filter((skill) => skill.featured && skill.active).length} featured</span></div></article>
        <article><span className="icon-box small"><Icon name="brain" size={20}/></span><div><small>Learning</small><strong>{skills.filter((skill) => skill.learning).length}</strong><span>Clearly labelled</span></div></article>
        <article><span className="icon-box small"><Icon name="eye" size={20}/></span><div><small>Hidden</small><strong>{skills.filter((skill) => !skill.active).length}</strong><span>Admin-only records</span></div></article>
      </div>

      <div className="profile-admin-layout">
        <section className="profile-admin-main">
          {groups.map((group) => (
            <details className="admin-panel profile-cms-card" key={group.id} open>
              <summary><span className={`icon-box small accent-${group.accent}`}><Icon name={group.icon} size={19}/></span><div><strong>{group.title}</strong><small>{group.skills.length} skills · {group.active ? "Visible" : "Hidden"}</small></div><Icon name="edit" size={17}/></summary>
              <form action={updateSkillGroupAction.bind(null, group.id)} className="profile-inline-form">
                <div className="form-row"><label>Group title<input name="title" required defaultValue={group.title}/></label><label>Icon<select name="icon" defaultValue={group.icon}>{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label></div>
                <label>Description<textarea name="description" rows={2} defaultValue={group.description ?? ""}/></label>
                <div className="form-row compact-form-row"><label>Accent<select name="accent" defaultValue={group.accent}>{accentOptions.map((accent) => <option key={accent}>{accent}</option>)}</select></label><label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={group.sortOrder}/></label></div>
                <div className="checkbox-cluster"><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked={group.active}/><span><strong>Publicly visible</strong><small>Hidden groups remain available to admin.</small></span></label><label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked={group.featured}/><span><strong>Homepage group</strong><small>Show this group in the skills section.</small></span></label></div>
                <div className="inline-actions"><SubmitButton pendingLabel="Saving group…">Save group</SubmitButton></div>
              </form>
              <form action={deleteSkillGroupAction.bind(null, group.id)} className="detached-delete-form"><ConfirmSubmitButton className="button button-danger" message={`Delete empty group “${group.title}”?`}>Delete empty group</ConfirmSubmitButton></form>
              <div className="profile-record-list">
                {group.skills.map((skill) => (
                  <details key={skill.id} className="profile-record">
                    <summary><span className="drag-handle">⋮⋮</span><div><strong>{skill.name}</strong><small>{skill.learning ? "Learning" : skill.proficiency || "Practised"}{skill.yearsExperience != null ? ` · ${skill.yearsExperience} years` : ""}</small></div><span className={`visibility ${skill.active ? "visible" : ""}`}>{skill.active ? (skill.featured ? "Featured" : "Visible") : "Hidden"}</span><Icon name="edit" size={15}/></summary>
                    <form action={updateSkillAction.bind(null, skill.id)} className="profile-inline-form nested-form">
                      <div className="form-row"><label>Skill name<input name="name" required defaultValue={skill.name}/></label><label>Group<select name="group_id" defaultValue={skill.groupId}>{groups.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></div>
                      <label>Description<textarea name="description" rows={2} defaultValue={skill.description ?? ""}/></label>
                      <div className="form-row three-col"><label>Proficiency label<input name="proficiency" defaultValue={skill.proficiency ?? ""} placeholder="Advanced"/></label><label>Level %<input name="proficiency_level" type="number" min={0} max={100} defaultValue={skill.proficiencyLevel ?? ""}/></label><label>Years<input name="years_experience" type="number" min={0} step="0.5" defaultValue={skill.yearsExperience ?? ""}/></label></div>
                      <label>Evidence URL<input name="evidence_url" type="url" defaultValue={skill.evidenceUrl ?? ""} placeholder="Optional project or certificate URL"/></label>
                      <label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={skill.sortOrder}/></label>
                      <div className="checkbox-cluster"><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked={skill.active}/><span><strong>Visible</strong></span></label><label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked={skill.featured}/><span><strong>Featured</strong></span></label><label className="checkbox-row"><input name="is_learning" type="checkbox" defaultChecked={skill.learning}/><span><strong>Currently learning</strong></span></label></div>
                      <div className="inline-actions"><SubmitButton pendingLabel="Saving skill…">Save skill</SubmitButton></div>
                    </form>{!skill.active ? <form action={deleteSkillAction.bind(null, skill.id)} className="detached-delete-form"><ConfirmSubmitButton className="button button-danger" message={`Permanently delete “${skill.name}”?`}>Delete hidden skill</ConfirmSubmitButton></form> : null}
                  </details>
                ))}
                {!group.skills.length ? <p className="settings-help">No skills in this group yet.</p> : null}
              </div>
            </details>
          ))}
        </section>

        <aside className="profile-admin-side">
          <section id="create-skill" className="admin-panel sticky-profile-form"><div className="panel-head"><div><span className="eyebrow">New record</span><h2>Add a skill</h2></div></div>
            <form action={createSkillAction} className="profile-inline-form">
              <label>Skill name<input name="name" required placeholder="Example: Tableau"/></label>
              <label>Group<select name="group_id" required defaultValue=""><option value="" disabled>Select a group</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
              <label>Description<textarea name="description" rows={2}/></label>
              <div className="form-row"><label>Proficiency<input name="proficiency" placeholder="Intermediate"/></label><label>Level %<input name="proficiency_level" type="number" min={0} max={100}/></label></div>
              <div className="form-row"><label>Years<input name="years_experience" type="number" min={0} step="0.5"/></label><label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={100}/></label></div>
              <label>Evidence URL<input name="evidence_url" type="url"/></label>
              <div className="checkbox-cluster"><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked/><span><strong>Visible</strong></span></label><label className="checkbox-row"><input name="is_featured" type="checkbox"/><span><strong>Featured</strong></span></label><label className="checkbox-row"><input name="is_learning" type="checkbox"/><span><strong>Learning</strong></span></label></div>
              <SubmitButton pendingLabel="Adding skill…"><Icon name="plus" size={16}/> Add skill</SubmitButton>
            </form>
          </section>
          <section className="admin-panel"><div className="panel-head"><div><span className="eyebrow">Organisation</span><h2>Create group</h2></div></div>
            <form action={createSkillGroupAction} className="profile-inline-form"><label>Title<input name="title" required/></label><label>Description<textarea name="description" rows={2}/></label><div className="form-row"><label>Icon<select name="icon" defaultValue="layers">{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label><label>Accent<select name="accent" defaultValue="blue">{accentOptions.map((accent) => <option key={accent}>{accent}</option>)}</select></label></div><label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={100}/></label><div className="checkbox-cluster"><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked/><span><strong>Visible</strong></span></label><label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked/><span><strong>Homepage</strong></span></label></div><SubmitButton pendingLabel="Creating group…">Create group</SubmitButton></form>
          </section>
        </aside>
      </div>
    </>
  );
}
