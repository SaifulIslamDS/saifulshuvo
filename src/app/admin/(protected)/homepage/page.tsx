import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createServiceAction, deleteServiceAction, updateHomepageAction, updateServiceAction } from "@/app/admin/(protected)/profile/actions";
import { getHomepageContent, getServices } from "@/lib/profile/queries";

const iconOptions = ["chart", "brain", "briefcase", "code", "layers", "search", "spark", "database"];
const accentOptions = ["blue", "cyan", "violet", "green", "orange"];
type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function HomepageCmsPage({ searchParams }: Props) {
  const [params, content, services] = await Promise.all([searchParams, getHomepageContent(), getServices({ admin: true })]);
  return <>
    <div className="admin-page-head"><div><span className="eyebrow">Public website</span><h1>Homepage CMS</h1><p>Manage positioning, hero copy, About content, statistics, services, process, CTA and section visibility.</p></div><a href="/" target="_blank" className="button button-secondary"><Icon name="eye" size={17}/> Preview homepage</a></div>
    <AdminFlash success={params.success} error={params.error}/>
    <form action={updateHomepageAction} className="homepage-editor-layout">
      <div className="homepage-editor-main">
        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Identity</span><h2>Professional profile</h2></div></div>
          <div className="form-row"><label>Owner name<input name="owner_name" required defaultValue={content.ownerName}/></label><label>Professional title<input name="professional_title" required defaultValue={content.professionalTitle}/></label></div>
          <label>Short biography<textarea name="short_bio" rows={4} required defaultValue={content.shortBio}/></label>
          <div className="form-row"><label>Contact email<input name="contact_email" type="email" required defaultValue={content.contactEmail}/></label><label>Location<input name="location" required defaultValue={content.location}/></label></div>
          <label>Availability message<input name="availability" required defaultValue={content.availability}/></label>
          <div className="form-row three-col"><label>GitHub URL<input name="github_url" type="url" required defaultValue={content.socialLinks.github ?? ""}/></label><label>LinkedIn URL<input name="linkedin_url" type="url" required defaultValue={content.socialLinks.linkedin ?? ""}/></label><label>Website URL<input name="website_url" type="url" required defaultValue={content.socialLinks.website ?? ""}/></label></div>
        </section>

        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">First impression</span><h2>Hero section</h2></div></div>
          <label>Eyebrow<input name="hero_eyebrow" required defaultValue={content.heroEyebrow}/></label>
          <div className="form-row"><label>Headline<input name="hero_heading" required defaultValue={content.heroHeading}/></label><label>Emphasised headline<input name="hero_emphasis" required defaultValue={content.heroEmphasis}/></label></div>
          <label>Introduction<textarea name="hero_lead" required minLength={30} rows={5} defaultValue={content.heroLead}/></label>
          <div className="form-row"><label>Primary button label<input name="hero_primary_label" required defaultValue={content.heroPrimaryLabel}/></label><label>Primary link<input name="hero_primary_href" required defaultValue={content.heroPrimaryHref}/></label></div>
          <div className="form-row"><label>Secondary button label<input name="hero_secondary_label" required defaultValue={content.heroSecondaryLabel}/></label><label>Secondary link<input name="hero_secondary_href" required defaultValue={content.heroSecondaryHref}/></label></div>
        </section>

        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Story</span><h2>About and positioning</h2></div></div>
          <label>About eyebrow<input name="about_eyebrow" required defaultValue={content.aboutEyebrow}/></label>
          <label>About title<input name="about_title" required defaultValue={content.aboutTitle}/></label>
          <label>About introduction<textarea name="about_description" rows={3} required defaultValue={content.aboutDescription}/></label>
          <label>About paragraphs — one paragraph per line<textarea name="about_paragraphs" rows={9} required defaultValue={content.aboutParagraphs.join("\n")}/></label>
          <label>Positioning card title<input name="positioning_title" required defaultValue={content.positioningTitle}/></label>
          <label>Positioning points — one per line<textarea name="positioning_points" rows={6} defaultValue={content.positioningPoints.join("\n")}/></label>
        </section>

        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Evidence</span><h2>Statistics</h2></div></div><p className="settings-help">Keep values and labels on matching lines. Four items work best in the current layout.</p>
          <div className="form-row"><label>Values — one per line<textarea name="stat_values" rows={6} defaultValue={content.stats.map((item) => item.value).join("\n")}/></label><label>Labels — one per line<textarea name="stat_labels" rows={6} defaultValue={content.stats.map((item) => item.label).join("\n")}/></label></div>
        </section>

        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Method</span><h2>Process and principles</h2></div></div><p className="settings-help">Process number, title and description lines are paired by position.</p>
          <div className="form-row three-col"><label>Numbers<textarea name="process_numbers" rows={7} defaultValue={content.processItems.map((item) => item.number).join("\n")}/></label><label>Titles<textarea name="process_titles" rows={7} defaultValue={content.processItems.map((item) => item.title).join("\n")}/></label><label>Descriptions<textarea name="process_descriptions" rows={7} defaultValue={content.processItems.map((item) => item.description).join("\n")}/></label></div>
          <label>Work principles — one per line<textarea name="work_principles" rows={7} defaultValue={content.workPrinciples.join("\n")}/></label>
        </section>

        <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Conversion</span><h2>Call to action</h2></div></div>
          <label>Eyebrow<input name="cta_eyebrow" required defaultValue={content.ctaEyebrow}/></label><label>Title<input name="cta_title" required defaultValue={content.ctaTitle}/></label><label>Description<textarea name="cta_description" rows={4} required defaultValue={content.ctaDescription}/></label>
          <div className="form-row"><label>Primary label<input name="cta_primary_label" required defaultValue={content.ctaPrimaryLabel}/></label><label>Primary link<input name="cta_primary_href" required defaultValue={content.ctaPrimaryHref}/></label></div>
          <div className="form-row"><label>Secondary label<input name="cta_secondary_label" required defaultValue={content.ctaSecondaryLabel}/></label><label>Secondary link<input name="cta_secondary_href" required defaultValue={content.ctaSecondaryHref}/></label></div>
        </section>
      </div>

      <aside className="homepage-editor-side"><section className="admin-panel project-publish-card sticky-profile-form"><div><span className="eyebrow">Homepage release</span><h2>Visibility and save</h2></div><p className="settings-help">Turn sections off without deleting their content.</p>
        <div className="section-toggle-list">{(["about","experience","services","skills","projects","insights","process","cta"] as const).map((key) => <label className="checkbox-row" key={key}><input name={`section_${key}`} type="checkbox" defaultChecked={content.sectionVisibility[key]}/><span><strong>{key[0].toUpperCase()+key.slice(1)}</strong></span></label>)}</div>
        <SubmitButton pendingLabel="Publishing homepage…"><Icon name="check" size={17}/> Save homepage</SubmitButton><div className="version-note"><span>Content version {content.version}</span><small>Saving revalidates the public homepage.</small></div></section></aside>
    </form>

    <section className="admin-panel service-cms-panel"><div className="panel-head"><div><span className="eyebrow">Homepage capabilities</span><h2>Services CMS</h2></div><span>{services.filter((service) => service.active).length} visible</span></div>
      <div className="service-admin-grid">{services.map((service) => <article className={!service.active ? "record-hidden" : ""} key={service.id}><form action={updateServiceAction.bind(null, service.id)} className="profile-inline-form"><div className="skill-title"><span className={`icon-box small accent-${service.accent}`}><Icon name={service.icon} size={19}/></span><strong>{service.title}</strong></div><label>Title<input name="title" required defaultValue={service.title}/></label><label>Description<textarea name="description" minLength={20} required rows={4} defaultValue={service.description}/></label><div className="form-row"><label>Icon<select name="icon" defaultValue={service.icon}>{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label><label>Accent<select name="accent" defaultValue={service.accent}>{accentOptions.map((accent) => <option key={accent}>{accent}</option>)}</select></label></div><label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={service.sortOrder}/></label><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked={service.active}/><span><strong>Visible</strong></span></label><SubmitButton pendingLabel="Saving service…">Save service</SubmitButton></form>{!service.active ? <form action={deleteServiceAction.bind(null, service.id)} className="detached-delete-form"><ConfirmSubmitButton className="button button-danger" message={`Permanently delete “${service.title}”?`}>Delete hidden service</ConfirmSubmitButton></form> : null}</article>)}</div>
      <details className="create-record-panel"><summary><Icon name="plus" size={17}/> Add a service</summary><form action={createServiceAction} className="profile-inline-form"><div className="form-row"><label>Title<input name="title" required/></label><label>Order<input name="sort_order" type="number" min={0} step={10} defaultValue={100}/></label></div><label>Description<textarea name="description" required minLength={20} rows={4}/></label><div className="form-row"><label>Icon<select name="icon" defaultValue="spark">{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label><label>Accent<select name="accent" defaultValue="blue">{accentOptions.map((accent) => <option key={accent}>{accent}</option>)}</select></label></div><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked/><span><strong>Visible</strong></span></label><SubmitButton pendingLabel="Adding service…">Create service</SubmitButton></form></details>
    </section>
  </>;
}
