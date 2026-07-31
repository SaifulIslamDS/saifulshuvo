import { Icon } from "@/components/Icon";

const successMessages: Record<string, string> = {
  created: "Project created successfully.",
  updated: "Project changes saved.",
  published: "Project published and added to the public portfolio.",
  drafted: "Project moved back to draft.",
  archived: "Project archived and removed from the public portfolio.",
  restored: "Project restored as a draft.",
  deleted: "Archived project permanently deleted.",
  featured: "Project added to the featured collection.",
  unfeatured: "Project removed from the featured collection.",
};

export function AdminFlash({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;
  const isError = Boolean(error);
  const content = error ?? successMessages[success ?? ""] ?? success ?? "Operation completed.";
  return (
    <div className={`admin-flash ${isError ? "admin-flash-error" : "admin-flash-success"}`} role={isError ? "alert" : "status"}>
      <Icon name={isError ? "close" : "check"} size={18} />
      <span>{content}</span>
    </div>
  );
}
