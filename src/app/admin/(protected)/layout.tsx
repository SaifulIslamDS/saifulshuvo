import type { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell user={admin}>{children}</AdminShell>;
}
