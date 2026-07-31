import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import { getAdminProjectById } from "@/lib/projects/queries";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProjectPreviewPage({ params }: Props) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();
  return <div className="admin-project-preview"><ProjectCaseStudy project={project} preview /></div>;
}
