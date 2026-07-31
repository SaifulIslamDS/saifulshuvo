import { Icon } from "@/components/Icon";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { CopyMediaUrl } from "@/components/admin/CopyMediaUrl";
import { archiveMediaAction, deleteMediaAction, restoreMediaAction, updateMediaMetadataAction } from "@/app/admin/(protected)/media/actions";
import { formatBytes, type MediaAsset } from "@/types/media";

export function MediaLibraryCard({ asset }: { asset: MediaAsset }) {
  return (
    <article className={`media-library-card media-${asset.status}`}>
      <div className="media-card-preview">
        {asset.mediaKind === "image" ? <img src={asset.publicUrl} alt={asset.altText ?? ""}/> : <div className="media-document-preview"><Icon name="file" size={40}/><span>PDF</span></div>}
        <span className={`publication-badge publication-${asset.status === "active" ? "published" : "archived"}`}>{asset.status}</span>
      </div>
      <div className="media-card-content">
        <div><strong title={asset.originalName}>{asset.originalName}</strong><small>{asset.purpose} · {formatBytes(asset.sizeBytes)} · {asset.usageCount} use{asset.usageCount === 1 ? "" : "s"}</small></div>
        <CopyMediaUrl value={asset.publicUrl}/>
        <details className="media-edit-details"><summary>Edit metadata</summary><form action={updateMediaMetadataAction.bind(null, asset.id)}><label>Purpose<select name="purpose" defaultValue={asset.purpose}><option value="general">General</option><option value="profile">Profile image</option><option value="project">Project artwork</option><option value="blog">Blog artwork</option><option value="cv">CV document</option></select></label><label>Alternative text<input name="alt_text" defaultValue={asset.altText ?? ""}/></label><label>Caption<textarea name="caption" rows={2} defaultValue={asset.caption ?? ""}/></label><button className="button button-secondary" type="submit">Save metadata</button></form></details>
        <div className="media-card-actions">
          {asset.status === "active" ? <form action={archiveMediaAction.bind(null, asset.id)}><ConfirmSubmitButton confirmMessage={asset.usageCount ? "Assigned media cannot be archived. Remove assignments first." : "Archive this media item?"} disabled={asset.usageCount > 0}><Icon name="archive" size={15}/> Archive</ConfirmSubmitButton></form> : <><form action={restoreMediaAction.bind(null, asset.id)}><button className="row-action" type="submit"><Icon name="restore" size={15}/> Restore</button></form><form action={deleteMediaAction.bind(null, asset.id)}><ConfirmSubmitButton confirmMessage="Permanently delete this file from Supabase Storage? This cannot be undone." variant="danger"><Icon name="trash" size={15}/> Delete</ConfirmSubmitButton></form></>}
        </div>
      </div>
    </article>
  );
}
