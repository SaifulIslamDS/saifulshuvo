import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { PortfolioProject } from "@/types/project";
import type { MediaAsset } from "@/types/media";

export function ProjectForm({
  project,
  action,
  submitLabel,
  mediaAssets,
}: {
  project?: PortfolioProject;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  mediaAssets: MediaAsset[];
}) {
  const selectedGallery = new Set(project?.gallery.map((asset) => asset.id) ?? []);
  return (
    <form action={action} className="project-editor-layout">
      <div className="project-editor-main">
        <section className="admin-panel project-form-section">
          <div className="panel-head">
            <div><span className="eyebrow">Core information</span><h2>Project identity</h2></div>
          </div>
          <div className="form-row">
            <label>Project title<input name="title" required minLength={3} defaultValue={project?.title ?? ""} placeholder="Example: Analytics Decision Hub" /></label>
            <label>URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={project?.slug ?? ""} placeholder="analytics-decision-hub" /></label>
          </div>
          <label>Category<input name="category" required defaultValue={project?.category ?? ""} placeholder="Analytics & Business Intelligence" /></label>
          <label>Short summary<textarea name="summary" required minLength={20} maxLength={360} rows={4} defaultValue={project?.summary ?? ""} placeholder="A concise public summary for project cards and search results." /></label>
          <label>Full overview<textarea name="description" required minLength={40} rows={7} defaultValue={project?.description ?? ""} placeholder="Explain the project, audience, context and overall value." /></label>
          <label>Your role<textarea name="role" required minLength={10} rows={4} defaultValue={project?.role ?? ""} placeholder="Describe your responsibilities and contribution." /></label>
        </section>

        <section className="admin-panel project-form-section">
          <div className="panel-head">
            <div><span className="eyebrow">Case study</span><h2>Problem, solution and outcomes</h2></div>
          </div>
          <label>Problem statement<textarea name="problem_statement" rows={5} defaultValue={project?.problemStatement ?? ""} placeholder="What problem, limitation or user need led to this project?" /></label>
          <label>Solution overview<textarea name="solution_overview" rows={6} defaultValue={project?.solutionOverview ?? ""} placeholder="How did the product, workflow or analysis address the problem?" /></label>
          <label>Outcomes — one per line<textarea name="outcomes" rows={6} defaultValue={project?.outcomes.join("\n") ?? ""} placeholder={'Clearer reporting workflow\nReduced manual preparation\nDocumented release process'} /></label>
        </section>

        <section className="admin-panel project-form-section">
          <div className="panel-head">
            <div><span className="eyebrow">Evidence</span><h2>Technology and highlights</h2></div>
          </div>
          <div className="form-row">
            <label>Technology stack — comma or new line<textarea name="stack" rows={6} defaultValue={project?.stack.join("\n") ?? ""} placeholder={'Next.js\nTypeScript\nSupabase'} /></label>
            <label>Key highlights — one per line<textarea name="highlights" rows={6} defaultValue={project?.highlights.join("\n") ?? ""} placeholder={'Secure owner-scoped access\nResponsive admin workflow\nVersioned releases'} /></label>
          </div>
          <div className="form-row">
            <label>Live project URL<input name="live_url" type="url" defaultValue={project?.liveUrl ?? ""} placeholder="https://example.com" /></label>
            <label>Source repository URL<input name="source_url" type="url" defaultValue={project?.sourceUrl ?? ""} placeholder="https://github.com/..." /></label>
          </div>
          <label>Cover image from media library<select name="cover_image_asset_id" defaultValue={project?.coverImageAssetId ?? ""}><option value="">No library cover selected</option>{mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName} · {asset.purpose}</option>)}</select></label>
          <label>External cover image URL<input name="cover_image_url" type="url" defaultValue={project?.coverImageAssetId ? "" : project?.coverImageUrl ?? ""} placeholder="Optional fallback when no library image is selected" /></label>
          <div className="media-assignment-field"><div><strong>Project gallery</strong><small>Select screenshots or supporting artwork. Order follows the media library selection.</small></div><div className="media-checkbox-grid">{mediaAssets.length ? mediaAssets.map((asset) => <label key={asset.id}><input name="gallery_asset_ids" type="checkbox" value={asset.id} defaultChecked={selectedGallery.has(asset.id)}/><img src={asset.publicUrl} alt=""/><span>{asset.originalName}</span></label>) : <small>No active images. Upload project media first.</small>}</div></div>
        </section>

        <section className="admin-panel project-form-section">
          <div className="panel-head">
            <div><span className="eyebrow">Search appearance</span><h2>Project SEO</h2></div>
          </div>
          <label>SEO title<input name="seo_title" maxLength={70} defaultValue={project?.seoTitle ?? ""} placeholder="Defaults to the project title" /></label>
          <label>SEO description<textarea name="seo_description" maxLength={180} rows={4} defaultValue={project?.seoDescription ?? ""} placeholder="Defaults to the project summary" /></label>
        </section>
      </div>

      <aside className="project-editor-sidebar">
        <section className="admin-panel project-publish-card">
          <div><span className="eyebrow">Publishing</span><h2>{project ? "Update project" : "Create project"}</h2></div>
          <label>Publication status
            <select name="publication_status" defaultValue={project?.publicationStatus ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>Project state
            <select name="project_state" defaultValue={project?.projectState ?? "in_development"}>
              <option value="live">Live</option>
              <option value="deployed">Deployed</option>
              <option value="portfolio">Portfolio</option>
              <option value="in_development">In development</option>
            </select>
          </label>
          <label>Accent colour
            <select name="accent" defaultValue={project?.accent ?? "blue"}>
              <option value="blue">Blue</option>
              <option value="cyan">Cyan</option>
              <option value="violet">Violet</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
            </select>
          </label>
          <label>Display order<input name="sort_order" type="number" min={0} step={10} defaultValue={project?.sortOrder ?? 100} /></label>
          <label className="checkbox-row"><input name="is_featured" type="checkbox" defaultChecked={project?.featured ?? false} /><span><strong>Featured project</strong><small>Show on the homepage when published.</small></span></label>
          <div className="project-form-actions">
            <SubmitButton pendingLabel="Saving project…"><Icon name="check" size={17} /> {submitLabel}</SubmitButton>
            <Link href="/admin/projects" className="button button-secondary">Cancel</Link>
          </div>
          {project ? <div className="version-note"><span>Version {project.version}</span><small>Last updated {project.updatedAt ? new Date(project.updatedAt).toLocaleString("en-GB") : "—"}</small></div> : null}
        </section>
      </aside>
    </form>
  );
}
