import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { PcCatalogPanel } from "@/components/pc-catalog-panel";
import { requireRoles } from "@/lib/auth";
import { readPcCatalog } from "@/lib/pcCatalogStore";

export default async function PcCatalogPage() {
  const session = await requireRoles(["admin", "manager", "sales", "technician"]);

  if (!session) {
    redirect("/login");
  }

  const initialCatalog = await readPcCatalog();

  return (
    <AdminShell
      title="PC catalogus beheer"
      subtitle="Onderhoud componenten, prijzen, Intel/AMD-compatibiliteit en productfoto-links."
      username={session.username}
      role={session.role}
    >
      <PcCatalogPanel initialCatalog={initialCatalog} />
    </AdminShell>
  );
}
