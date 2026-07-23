
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function Home() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return <AdminDashboard />;
}
