import Link from "next/link";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createProjectAction } from "../actions";
import { getAdminImageAssets } from "@/lib/media/queries";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewProjectPage({ searchParams }: Props) {
  const [params, mediaAssets] = await Promise.all([searchParams, getAdminImageAssets()]);
  return (
    <>
      <div className="admin-page-head project-editor-head">
        <div><Link className="admin-back-link" href="/admin/projects">← Projects</Link><span className="eyebrow">New case study</span><h1>Create project</h1><p>Add the content as a draft, preview it, then publish when ready.</p></div>
      </div>
      <AdminFlash error={params.error} />
      <ProjectForm action={createProjectAction} submitLabel="Create project" mediaAssets={mediaAssets} />
    </>
  );
}
