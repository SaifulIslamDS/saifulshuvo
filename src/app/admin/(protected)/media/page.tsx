import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { MediaLibraryCard } from "@/components/admin/MediaLibraryCard";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { getAdminMediaAssets } from "@/lib/media/queries";
import type { MediaKind, MediaPurpose, MediaStatus } from "@/types/media";

type Props = { searchParams: Promise<{ q?: string; kind?: string; purpose?: string; status?: string; success?: string; error?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const params = await searchParams;
  const assets = await getAdminMediaAssets({
    query: params.q,
    kind: (params.kind as MediaKind | "all") || "all",
    purpose: (params.purpose as MediaPurpose | "all") || "all",
    status: (params.status as MediaStatus | "all") || "active",
  });
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Storage workspace</span><h1>Media library</h1><p>Upload, describe, assign and safely retire portfolio images and CV documents.</p></div></div>
      <AdminFlash success={params.success} error={params.error}/>
      <div className="media-admin-layout">
        <MediaUploadForm/>
        <section className="admin-panel media-library-panel">
          <div className="panel-head"><div><span className="eyebrow">Library</span><h2>{assets.length} media item{assets.length === 1 ? "" : "s"}</h2></div></div>
          <form className="media-filter-bar">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search filename, alt text or caption"/>
            <select name="kind" defaultValue={params.kind ?? "all"}><option value="all">All types</option><option value="image">Images</option><option value="document">Documents</option></select>
            <select name="purpose" defaultValue={params.purpose ?? "all"}><option value="all">All purposes</option><option value="general">General</option><option value="profile">Profile</option><option value="project">Project</option><option value="blog">Blog</option><option value="cv">CV</option></select>
            <select name="status" defaultValue={params.status ?? "active"}><option value="active">Active</option><option value="archived">Archived</option><option value="all">All status</option></select>
            <button className="button button-secondary" type="submit">Filter</button>
          </form>
          {assets.length ? <div className="media-library-grid">{assets.map((asset) => <MediaLibraryCard key={asset.id} asset={asset}/>)}</div> : <div className="empty-state"><Icon name="image" size={34}/><h3>No media found</h3><p>Upload a file or change the current filters.</p></div>}
        </section>
      </div>
    </>
  );
}
