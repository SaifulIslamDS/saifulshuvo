import { Icon } from "@/components/Icon";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { uploadMediaAction } from "@/app/admin/(protected)/media/actions";

export function MediaUploadForm() {
  return (
    <form action={uploadMediaAction} className="admin-panel media-upload-panel">
      <div className="panel-head"><div><span className="eyebrow">Upload</span><h2>Add media</h2></div><span className="icon-box small"><Icon name="upload" size={20}/></span></div>
      <label>File<input name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"/><small>Images up to 8 MB; PDF up to 10 MB. SVG and executable files are blocked.</small></label>
      <div className="form-row">
        <label>Purpose<select name="purpose" defaultValue="general"><option value="general">General</option><option value="profile">Profile image</option><option value="project">Project artwork</option><option value="blog">Blog artwork</option><option value="cv">CV document</option></select></label>
        <label>Alternative text<input name="alt_text" maxLength={180} placeholder="Describe the image for accessibility"/></label>
      </div>
      <label>Caption<textarea name="caption" rows={2} maxLength={300} placeholder="Optional editorial caption or internal note"/></label>
      <details className="cv-upload-options"><summary>CV metadata <span>Required only when purpose is CV document</span></summary><div className="form-row"><label>CV title<input name="cv_title" defaultValue="Curriculum Vitae"/></label><label>Version label<input name="cv_version_label" placeholder="2026-07 or Remote Analytics CV"/></label></div><label>CV notes<textarea name="cv_notes" rows={2} placeholder="What changed in this version?"/></label></details>
      <SubmitButton pendingLabel="Uploading media…"><Icon name="upload" size={17}/> Upload to library</SubmitButton>
    </form>
  );
}
