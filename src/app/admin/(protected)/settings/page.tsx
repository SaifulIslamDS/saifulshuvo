import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteCvDocumentAction, setActiveCvAction, setProfileImageAction, updateCvMetadataAction } from "@/app/admin/(protected)/media/actions";
import { getAdminCvDocuments, getAdminImageAssets, getPublicSiteMedia } from "@/lib/media/queries";
import { formatBytes } from "@/types/media";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function AdminSettingsPage({ searchParams }: Props) {
  const [params, images, cvs, siteMedia] = await Promise.all([
    searchParams,
    getAdminImageAssets(),
    getAdminCvDocuments(),
    getPublicSiteMedia(),
  ]);
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Configuration</span><h1>Profile image and CV</h1><p>Select approved media library assets for your public identity and downloadable résumé.</p></div><Link href="/admin/media" className="button button-secondary"><Icon name="image" size={17}/> Open media library</Link></div>
      <AdminFlash success={params.success} error={params.error}/>
      <div className="settings-layout">
        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Public identity</span><h2>Profile image</h2></div></div>
          <div className="profile-upload">
            <div className="portrait-placeholder admin-portrait">
              {siteMedia.profileImage ? <img src={siteMedia.profileImage.publicUrl} alt={siteMedia.profileImage.altText ?? "Saiful Islam"}/> : <div className="portrait-ring"><div className="portrait-core">SI</div></div>}
            </div>
            <div><strong>{siteMedia.profileImage?.originalName ?? "No profile image selected"}</strong><p>Choose an active image from the media library. Recommended: square JPG or WebP, at least 1200 × 1200 px.</p></div>
          </div>
          <form action={setProfileImageAction} className="settings-assignment-form">
            <label>Selected profile image<select name="profile_image_asset_id" defaultValue={siteMedia.profileImage?.id ?? ""}><option value="">Use initials placeholder</option>{images.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName} · {asset.purpose}</option>)}</select></label>
            <button className="button button-primary" type="submit"><Icon name="check" size={17}/> Save profile image</button>
          </form>
        </section>

        <aside className="settings-side">
          <section className="admin-panel">
            <div className="panel-head"><div><span className="eyebrow">Public résumé</span><h2>Active CV</h2></div></div>
            <form action={setActiveCvAction} className="settings-assignment-form">
              <label>CV version<select name="active_cv_document_id" defaultValue={siteMedia.activeCv?.id ?? ""}><option value="">Hide CV button</option>{cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.versionLabel} · {cv.title}</option>)}</select></label>
              <button className="button button-primary" type="submit"><Icon name="check" size={17}/> Set active CV</button>
            </form>
            {siteMedia.activeCv ? <div className="active-cv-summary"><Icon name="file" size={22}/><div><strong>{siteMedia.activeCv.title}</strong><span>{siteMedia.activeCv.versionLabel} · {formatBytes(siteMedia.activeCv.media.sizeBytes)}</span></div><a href="/cv" target="_blank" rel="noreferrer">Preview</a></div> : <p className="settings-help">Upload a PDF with purpose “CV document” in the media library, then select it here.</p>}
          </section>
        </aside>
      </div>

      <section className="admin-panel cv-version-panel">
        <div className="panel-head"><div><span className="eyebrow">Version history</span><h2>CV documents</h2></div><Link href="/admin/media" className="text-link">Upload a new version <Icon name="arrow" size={16}/></Link></div>
        {cvs.length ? <div className="cv-version-list">{cvs.map((cv) => <article key={cv.id} className={cv.isActive ? "cv-version-active" : ""}><div className="cv-version-icon"><Icon name="file" size={24}/></div><form action={updateCvMetadataAction.bind(null, cv.id)}><div className="form-row"><label>Title<input name="title" defaultValue={cv.title}/></label><label>Version label<input name="version_label" defaultValue={cv.versionLabel}/></label></div><label>Notes<textarea name="notes" rows={2} defaultValue={cv.notes ?? ""}/></label><div className="cv-version-meta"><span>{formatBytes(cv.media.sizeBytes)} · {new Date(cv.createdAt).toLocaleDateString("en-GB")}</span>{cv.isActive ? <strong>Active CV</strong> : null}</div><button className="button button-secondary" type="submit">Save metadata</button></form><div className="cv-version-actions"><a className="row-action" href={cv.media.publicUrl} target="_blank" rel="noreferrer">Open PDF</a>{!cv.isActive ? <form action={deleteCvDocumentAction.bind(null, cv.id)}><ConfirmSubmitButton className="row-action-danger" message={`Delete CV version “${cv.versionLabel}”? The media asset will be archived.`}>Delete version</ConfirmSubmitButton></form> : null}</div></article>)}</div> : <div className="empty-state"><Icon name="file" size={34}/><h3>No CV versions</h3><p>Upload your first PDF from the media library.</p></div>}
      </section>
    </>
  );
}
