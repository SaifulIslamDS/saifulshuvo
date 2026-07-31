import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminProjectById } from "@/lib/projects/queries";
import { updateProjectAction } from "../../actions";
import { getAdminImageAssets } from "@/lib/media/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function EditProjectPage({ params, searchParams }: Props) {
  const [{ id }, query, mediaAssets] = await Promise.all([params, searchParams, getAdminImageAssets()]);
  const project = await getAdminProjectById(id);
  if (!project) notFound();
  return (
    <>
      <div className="admin-page-head project-editor-head">
        <div><Link className="admin-back-link" href="/admin/projects">← Projects</Link><span className="eyebrow">Project editor</span><h1>{project.title}</h1><p>Update content, preview every status and control public visibility.</p></div>
        <Link href={`/admin/projects/${project.id}/preview`} className="button button-secondary">Preview project</Link>
      </div>
      <AdminFlash success={query.success} error={query.error} />
      <ProjectForm project={project} action={updateProjectAction.bind(null, project.id)} submitLabel="Save changes" mediaAssets={mediaAssets} />
    </>
  );
}
