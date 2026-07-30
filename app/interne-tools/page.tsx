import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { InternalToolsPanel } from "@/components/internal-tools-panel";
import { getSessionUser } from "@/lib/auth";

export default async function InterneToolsPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminShell
      title="Interne tools"
      subtitle="Operationeel overzicht voor planning, support en interne processen."
      username={session.username}
      role={session.role}
    >
      <InternalToolsPanel />
    </AdminShell>
  );
}
