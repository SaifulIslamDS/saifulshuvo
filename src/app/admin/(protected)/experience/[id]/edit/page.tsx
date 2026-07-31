import { notFound } from "next/navigation";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { updateExperienceAction } from "@/app/admin/(protected)/profile/actions";
import { getExperienceById } from "@/lib/profile/queries";
export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const entry = await getExperienceById(id); if (!entry) notFound(); return <><div className="admin-page-head"><div><span className="eyebrow">Experience CMS</span><h1>Edit experience</h1><p>Update evidence, timeline and public visibility.</p></div></div><ExperienceForm experience={entry} action={updateExperienceAction.bind(null, id)} submitLabel="Save experience"/></>; }
