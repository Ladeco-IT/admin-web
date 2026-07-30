import { listAppointments } from "@/lib/appointmentStore";
import { listCustomers } from "@/lib/customerStore";
import { listUsers } from "@/lib/userStore";

type ToolLink = {
  key: string;
  title: string;
  description: string;
};

export async function buildInternalOverview() {
  const [appointments, customers, users] = await Promise.all([
    listAppointments(),
    listCustomers(),
    listUsers(),
  ]);

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const openAppointments = appointments.length - completedAppointments;

  const tools: ToolLink[] = [
    {
      key: "remote-checklist",
      title: "Remote interventie checklist",
      description: "Gestandaardiseerde checklist voor remote support sessies.",
    },
    {
      key: "security-audit",
      title: "Security audit voorbereiding",
      description: "Taken om endpoints en toegang te valideren voor audits.",
    },
    {
      key: "backup-verificatie",
      title: "Backup verificatie",
      description: "Wekelijkse controlepunten voor backup en restore tests.",
    },
  ];

  return {
    ok: true,
    stats: {
      users: users.length,
      customers: customers.length,
      appointments: appointments.length,
      openAppointments,
      completedAppointments,
    },
    tools,
  };
}
