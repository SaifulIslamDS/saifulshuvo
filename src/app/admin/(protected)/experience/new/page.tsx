import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { createExperienceAction } from "@/app/admin/(protected)/profile/actions";
export default function NewExperiencePage() { return <><div className="admin-page-head"><div><span className="eyebrow">Experience CMS</span><h1>Add experience</h1><p>Create a professional role, career milestone or portfolio phase.</p></div></div><ExperienceForm action={createExperienceAction} submitLabel="Create experience"/></>; }
