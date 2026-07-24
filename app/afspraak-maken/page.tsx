import { redirect } from "next/navigation";

import { AppointmentForm } from "@/components/appointment-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AfspraakMakenPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return <AppointmentForm />;
}
