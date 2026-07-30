import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { UserManagementPanel } from "@/components/user-management-panel";
import { getSessionUser } from "@/lib/auth";

export default async function TeamPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin" && session.role !== "manager") {
    redirect("/");
  }

  return (
    <AdminShell
      title="Accountbeheer"
      subtitle="Maak accounts aan, ken rollen toe en beheer actieve toegang."
      username={session.username}
      role={session.role}
    >
      <UserManagementPanel currentRole={session.role} />
    </AdminShell>
  );
}
