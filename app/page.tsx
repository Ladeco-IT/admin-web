
import { redirect } from "next/navigation";

import { AppointmentsOverview } from "@/components/appointments-overview";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return <AppointmentsOverview currentUser={session} />;
}
