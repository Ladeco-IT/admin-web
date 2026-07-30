import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { CustomerManagementPanel } from "@/components/customer-management-panel";
import { getSessionUser } from "@/lib/auth";

export default async function KlantenPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminShell
      title="Klantenbeheer"
      subtitle="Beheer klantprofielen, contactgegevens en interne notities."
      username={session.username}
      role={session.role}
    >
      <CustomerManagementPanel />
    </AdminShell>
  );
}
