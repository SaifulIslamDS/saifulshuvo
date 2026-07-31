import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ExperienceRecord } from "@/types/profile";

export function ExperienceForm({ experience, action, submitLabel }: { experience?: ExperienceRecord; action: (formData: FormData) => void | Promise<void>; submitLabel: string }) {
  return <form action={action} className="project-editor-layout experience-editor">
    <div className="project-editor-main">
      <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Professional history</span><h2>Role and organisation</h2></div></div>
        <div className="form-row"><label>Role or experience title<input name="title" required minLength={3} defaultValue={experience?.title ?? ""}/></label><label>Organisation or context<input name="organization" required defaultValue={experience?.organization ?? ""}/></label></div>
        <div className="form-row"><label>Employment type<input name="employment_type" defaultValue={experience?.employmentType ?? ""} placeholder="Full-time, freelance, portfolio"/></label><label>Location<input name="location" defaultValue={experience?.location ?? ""}/></label></div>
        <label>Summary<textarea name="summary" required minLength={20} rows={6} defaultValue={experience?.summary ?? ""}/></label>
      </section>
      <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Timeline</span><h2>Dates and public label</h2></div></div>
        <div className="form-row three-col"><label>Start date<input name="start_date" type="date" defaultValue={experience?.startDate ?? ""}/></label><label>End date<input name="end_date" type="date" defaultValue={experience?.endDate ?? ""}/></label><label>Public period label<input name="period_label" defaultValue={experience?.periodLabel ?? ""} placeholder="13+ years or 2020–Present"/></label></div>
        <label className="checkbox-row"><input name="is_current" type="checkbox" defaultChecked={experience?.current ?? false}/><span><strong>Current experience</strong><small>End date will be cleared when saved.</small></span></label>
      </section>
      <section className="admin-panel project-form-section"><div className="panel-head"><div><span className="eyebrow">Evidence</span><h2>Achievements and technologies</h2></div></div>
        <div className="form-row"><label>Achievements — one per line<textarea name="achievements" rows={7} defaultValue={experience?.achievements.join("\n") ?? ""}/></label><label>Technologies or capabilities — one per line<textarea name="technologies" rows={7} defaultValue={experience?.technologies.join("\n") ?? ""}/></label></div>
      </section>
    </div>
    <aside className="project-editor-sidebar"><section className="admin-panel project-publish-card"><div><span className="eyebrow">Visibility</span><h2>{experience ? "Update experience" : "Create experience"}</h2></div><label>Display order<input name="sort_order" type="number" min={0} step={10} defaultValue={experience?.sortOrder ?? 100}/></label><label className="checkbox-row"><input name="is_active" type="checkbox" defaultChecked={experience?.active ?? true}/><span><strong>Publicly visible</strong><small>Hidden entries remain in the CMS.</small></span></label><label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked={experience?.featured ?? true}/><span><strong>Homepage experience</strong><small>Show in the homepage professional foundation section.</small></span></label><div className="project-form-actions"><SubmitButton pendingLabel="Saving experience…"><Icon name="check" size={17}/> {submitLabel}</SubmitButton><Link href="/admin/experience" className="button button-secondary">Cancel</Link></div></section></aside>
  </form>;
}
